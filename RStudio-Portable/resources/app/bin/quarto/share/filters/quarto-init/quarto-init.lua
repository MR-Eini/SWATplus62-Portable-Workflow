-- pandoc.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

local readqmd = require("readqmd")

function hasBootstrap() 
  local hasBootstrap = param("has-bootstrap", false)
  return hasBootstrap
end

-- read attribute w/ default
function attribute(el, name, default)
  return el.attributes[name] or default
end

function removeClass(classes, remove)
  return classes:filter(function(clz) return clz ~= remove end)
end

function combineFilters(filters) 

  -- the final list of filters
  local filterList = {}
  for _, filter in ipairs(filters) do
    for key,func in pairs(filter) do

      -- ensure that there is a list for this key
      if filterList[key] == nil then
        filterList[key] = pandoc.List()
      end

      -- add the current function to the list
      filterList[key]:insert(func)
    end
  end

  local combinedFilters = {}
  for key,fns in pairs(filterList) do

    -- if there is only one function for this key
    -- just use it
    if #fns == 1 then
      combinedFilters[key] = fns[1]
    else
      -- otherwise combine them into a single function
      combinedFilters[key] = function(x) 
        -- capture the current value
        local current = x

        -- iterate through functions for this key
        for _, fn in ipairs(fns) do
          local result = fn(current)
          if result ~= nil then
            if (pandoc.utils.type(result) ~= pandoc.utils.type(current) or
                result.t ~= current.t) then
              -- luacov: disable
              quarto.log.info("combineFilters: expected " .. (current.t or pandoc.utils.type(current)) .. " got " .. (result.t or pandoc.utils.type(result)))
              quarto.log.info("Exiting filter early. (This is a potential bug in Quarto.)")
              return result
              -- luacov: enable
            end
            -- if there is a result from this function
            -- update the current value with the result
            current = result
          end
        end

        -- return result from calling the functions
        return current
      end
    end
  end
  return combinedFilters
end

function inlinesToString(inlines)
  local pt = pandoc.utils.type(inlines)
  if pt ~= "Inlines" then
    -- luacov: disable
    fail("inlinesToString: expected Inlines, got " .. pt)
    return ""
    -- luacov: enable
  end
  return pandoc.utils.stringify(pandoc.Span(inlines))
end

local InlinesMT = getmetatable(pandoc.Inlines{})

-- lua string to pandoc inlines
function stringToInlines(str)
  if str then
    return setmetatable({pandoc.Str(str)}, InlinesMT)
  else
    return setmetatable({}, InlinesMT)
  end
end

-- FIXME we should no longer be using this.
-- lua string with markdown to pandoc inlines
function markdownToInlines(str)
  if str then
    local doc = pandoc.read(str)
    return pandoc.utils.blocks_to_inlines(doc.blocks)
  else
    return setmetatable({}, InlinesMT)
  end
end


function stripTrailingSpace(inlines)
  -- we always convert to pandoc.Inlines to ensure a uniform
  -- return type (and its associated methods)
  if #inlines > 0 then
    if inlines[#inlines].t == "Space" then
      return setmetatable(tslice(inlines, 1, #inlines - 1), InlinesMT)
    else
      return setmetatable(inlines, InlinesMT)
    end
  else
    return setmetatable(inlines, InlinesMT)
  end
end

-- non-breaking space
function nbspString()
  return pandoc.Str '\u{a0}'
end

-- the first heading in a div is sometimes the caption
function resolveHeadingCaption(div) 
  local capEl = div.content[1]
  if capEl ~= nil and is_regular_node(capEl, "Header") then
    div.content:remove(1)
    return quarto.utils.as_inlines(capEl.content)
  else 
    return pandoc.Inlines({})
  end
end

local kBlockTypes = {
  "BlockQuote",
  "BulletList", 
  "CodeBlock ",
  "DefinitionList",
  "Div",
  "Header",
  "HorizontalRule",
  "LineBlock",
  "OrderedList",
  "Para",
  "Plain",
  "RawBlock",
  "Table"
}

function isBlockEl(el)
  return tcontains(kBlockTypes, el.t)
end

function isInlineEl(el)
  return not isBlockEl(el)
end

function compileTemplate(template, meta)
  local f = io.open(pandoc.utils.stringify(template), "r")
  if f then
    local contents = f:read("*all")
    f:close()
    -- compile the title block template
    local compiledTemplate = pandoc.template.compile(contents)
    local template_opts = pandoc.WriterOptions {template = compiledTemplate}  

    -- render the current document and read it to generate an AST for the
    -- title block
    local metaDoc = pandoc.Pandoc(pandoc.Blocks({}), meta)
    local rendered = pandoc.write(metaDoc, 'gfm', template_opts)

    -- read the rendered document 
    local renderedDoc = pandoc.read(rendered, 'gfm')

    return renderedDoc.blocks
  else
    -- luacov: disable
    fail('Error compiling template: ' .. template)
    -- luacov: enable
  end
end


function merge_attrs(attr, ...)
  local result = pandoc.Attr(attr.identifier, attr.classes, attr.attributes)
  for _, a in ipairs({...}) do
    if a ~= nil then
      result.identifier = result.identifier or a.identifier
      result.classes:extend(a.classes)
      for k, v in pairs(a.attributes) do
        result.attributes[k] = v
      end
    end
  end
  return result
end

-- used to convert metatable, attributetable, etc
-- to plain tables that can be serialized to JSON
function as_plain_table(value)
  local result = {}
  for k, v in pairs(value) do
    result[k] = v
  end
  return result
end

function string_to_quarto_ast_blocks(text, opts)
  local doc = readqmd.readqmd(text, opts or quarto_global_state.reader_options)
  
  -- run the whole normalization pipeline here to get extended AST nodes, etc.
  for _, filter in ipairs(quarto_ast_pipeline()) do
    doc = _quarto.traverser(doc, filter.filter)
  end

  -- compute flags so we don't skip filters that depend on them
  _quarto.traverser(doc, compute_flags())
  return doc.blocks
end

function string_to_quarto_ast_inlines(text, sep)
  return pandoc.utils.blocks_to_inlines(string_to_quarto_ast_blocks(text), sep)
end
---@diagnostic disable: undefined-field
--[[

 base64 -- v1.5.3 public domain Lua base64 encoder/decoder
 no warranty implied; use at your own risk

 Needs bit32.extract function. If not present it's implemented using BitOp
 or Lua 5.3 native bit operators. For Lua 5.1 fallbacks to pure Lua
 implementation inspired by Rici Lake's post:
   http://ricilake.blogspot.co.uk/2007/10/iterating-bits-in-lua.html

 author: Ilya Kolbin (iskolbin@gmail.com)
 url: github.com/iskolbin/lbase64

 COMPATIBILITY

 Lua 5.1+, LuaJIT

 LICENSE

 See end of file for license information.

--]]


local extract = _G.bit32 and _G.bit32.extract -- Lua 5.2/Lua 5.3 in compatibility mode
if not extract then
	if _G.bit then -- LuaJIT
		local shl, shr, band = _G.bit.lshift, _G.bit.rshift, _G.bit.band
		extract = function( v, from, width )
			return band( shr( v, from ), shl( 1, width ) - 1 )
		end
	elseif _G._VERSION == "Lua 5.1" then
		extract = function( v, from, width )
			local w = 0
			local flag = 2^from
			for i = 0, width-1 do
				local flag2 = flag + flag
				if v % flag2 >= flag then
					w = w + 2^i
				end
				flag = flag2
			end
			return w
		end
	else -- Lua 5.3+
		extract = load[[return function( v, from, width )
			return ( v >> from ) & ((1 << width) - 1)
		end]]()
	end
end


function base64_makeencoder( s62, s63, spad )
	local encoder = {}
	for b64code, char in pairs{[0]='A','B','C','D','E','F','G','H','I','J',
		'K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y',
		'Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n',
		'o','p','q','r','s','t','u','v','w','x','y','z','0','1','2',
		'3','4','5','6','7','8','9',s62 or '+',s63 or'/',spad or'='} do
		encoder[b64code] = char:byte()
	end
	return encoder
end

function base64_makedecoder( s62, s63, spad )
	local decoder = {}
	for b64code, charcode in pairs( base64_makeencoder( s62, s63, spad )) do
		decoder[charcode] = b64code
	end
	return decoder
end

local DEFAULT_ENCODER = base64_makeencoder()
local DEFAULT_DECODER = base64_makedecoder()

local char, concat = string.char, table.concat

function base64_encode( str, encoder, usecaching )
	encoder = encoder or DEFAULT_ENCODER
	local t, k, n = {}, 1, #str
	local lastn = n % 3
	local cache = {}
	for i = 1, n-lastn, 3 do
		local a, b, c = str:byte( i, i+2 )
		local v = a*0x10000 + b*0x100 + c
		local s
		if usecaching then
			s = cache[v]
			if not s then
				s = char(encoder[extract(v,18,6)], encoder[extract(v,12,6)], encoder[extract(v,6,6)], encoder[extract(v,0,6)])
				cache[v] = s
			end
		else
			s = char(encoder[extract(v,18,6)], encoder[extract(v,12,6)], encoder[extract(v,6,6)], encoder[extract(v,0,6)])
		end
		t[k] = s
		k = k + 1
	end
	if lastn == 2 then
		local a, b = str:byte( n-1, n )
		local v = a*0x10000 + b*0x100
		t[k] = char(encoder[extract(v,18,6)], encoder[extract(v,12,6)], encoder[extract(v,6,6)], encoder[64])
	elseif lastn == 1 then
		local v = str:byte( n )*0x10000
		t[k] = char(encoder[extract(v,18,6)], encoder[extract(v,12,6)], encoder[64], encoder[64])
	end
	return concat( t )
end

function base64_decode( b64, decoder, usecaching )
	decoder = decoder or DEFAULT_DECODER
	local pattern = '[^%w%+%/%=]'
	if decoder then
		local s62, s63
		for charcode, b64code in pairs( decoder ) do
			if b64code == 62 then s62 = charcode
			elseif b64code == 63 then s63 = charcode
			end
		end
		pattern = ('[^%%w%%%s%%%s%%=]'):format( char(s62), char(s63) )
	end
	b64 = b64:gsub( pattern, '' )
	local cache = usecaching and {}
	local t, k = {}, 1
	local n = #b64
	local padding = b64:sub(-2) == '==' and 2 or b64:sub(-1) == '=' and 1 or 0
	for i = 1, padding > 0 and n-4 or n, 4 do
		local a, b, c, d = b64:byte( i, i+3 )
		local s
		if usecaching then
			local v0 = a*0x1000000 + b*0x10000 + c*0x100 + d
			s = cache[v0]
			if not s then
				local v = decoder[a]*0x40000 + decoder[b]*0x1000 + decoder[c]*0x40 + decoder[d]
				s = char( extract(v,16,8), extract(v,8,8), extract(v,0,8))
				cache[v0] = s
			end
		else
			local v = decoder[a]*0x40000 + decoder[b]*0x1000 + decoder[c]*0x40 + decoder[d]
			s = char( extract(v,16,8), extract(v,8,8), extract(v,0,8))
		end
		t[k] = s
		k = k + 1
	end
	if padding == 1 then
		local a, b, c = b64:byte( n-3, n-1 )
		local v = decoder[a]*0x40000 + decoder[b]*0x1000 + decoder[c]*0x40
		t[k] = char( extract(v,16,8), extract(v,8,8))
	elseif padding == 2 then
		local a, b = b64:byte( n-3, n-2 )
		local v = decoder[a]*0x40000 + decoder[b]*0x1000
		t[k] = char( extract(v,16,8))
	end
	return concat( t )
end

--[[
------------------------------------------------------------------------------
This software is available under 2 licenses -- choose whichever you prefer.
------------------------------------------------------------------------------
ALTERNATIVE A - MIT License
Copyright (c) 2018 Ilya Kolbin
Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
------------------------------------------------------------------------------
ALTERNATIVE B - Public Domain (www.unlicense.org)
This is free and unencumbered software released into the public domain.
Anyone is free to copy, modify, publish, use, compile, sell, or distribute this
software, either in source code form or as a compiled binary, for any purpose,
commercial or non-commercial, and by any means.
In jurisdictions that recognize copyright laws, the author or authors of this
software dedicate any and all copyright interest in the software to the public
domain. We make this dedication for the benefit of the public at large and to
the detriment of our heirs and successors. We intend this dedication to be an
overt act of relinquishment in perpetuity of all present and future rights to
this software under copyright law.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
------------------------------------------------------------------------------
--]]
-- paths.lua
-- Copyright (C) 2022 Posit Software, PBC

function resourceRef(ref, dir)
  -- if the ref starts with / then just strip if off
  if string.find(ref, "^/") then
    -- check for protocol relative url
    if string.find(ref, "^//") == nil then
      return pandoc.text.sub(ref, 2, #ref)
    else
      return ref
    end
  -- if it's a relative ref then prepend the resource dir
  elseif isRelativeRef(ref) then
    if dir == '.' then
      return ref
    else
      return dir .. "/" .. ref
    end
  else
  -- otherwise just return it
    return ref
  end
end

function fixIncludePath(ref, dir)
  -- if it's a relative ref then prepend the resource dir
  if isRelativeRef(ref) then
    if dir ~= "." then
      return dir .. "/" .. ref
    else
      return ref
    end
  else
  -- otherwise just return it
    return ref
  end
end


function isRelativeRef(ref)
  return ref:find("^/") == nil and 
         ref:find("^%a+://") == nil and 
         ref:find("^data:") == nil and 
         ref:find("^#") == nil
end



function handlePaths(el, path, replacer)
  el.text = handleHtmlRefs(el.text, path, "img", "src", replacer)
  el.text = handleHtmlRefs(el.text, path, "img", "data-src", replacer)
  el.text = handleHtmlRefs(el.text, path, "link", "href", replacer)
  el.text = handleHtmlRefs(el.text, path, "script", "src", replacer)
  el.text = handleHtmlRefs(el.text, path, "source", "src", replacer)
  el.text = handleHtmlRefs(el.text, path, "embed", "src", replacer)
  el.text = handleCssRefs(el.text, path, "@import%s+", replacer)
  el.text = handleCssRefs(el.text, path, "url%(", replacer)
end


function handleHtmlRefs(text, resourceDir, tag, attrib, replacer)
  return text:gsub("(<" .. tag .. " [^>]*" .. attrib .. "%s*=%s*)\"([^\"]+)\"", function(preface, value)
    return preface .. "\"" .. replacer(value, resourceDir) .. "\""
  end)
end

function handleCssRefs(text, resourceDir, prefix, replacer)
  return text:gsub("(" .. prefix .. ")\"([^\"]+)\"", function(preface, value)
    return preface .. "\"" .. replacer(value, resourceDir) .. "\""
  end) 
end
-- file-metadata.lua
-- Copyright (C) 2020-2022 Posit Software, PBC


fileMetadataState = {
  file = nil,
  appendix = false,
  include_directory = nil,
}


function file_metadata() 
  return {
    RawInline = parseFileMetadata,
    RawBlock = parseFileMetadata      
  }
end

function parseFileMetadata(el)
  if _quarto.format.isRawHtml(el) then
    local rawMetadata = string.match(el.text, "^<!%-%- quarto%-file%-metadata: ([^ ]+) %-%->$")
    if rawMetadata then
      local decoded = base64_decode(rawMetadata)
      local file = quarto.json.decode(decoded)
      fileMetadataState.file = file
      -- flip into appendix mode as appropriate
      if file.bookItemType == "appendix" then
        fileMetadataState.appendix = true
      end

      -- set and unset file directory for includes
      if file.include_directory ~= nil then
        fileMetadataState.include_directory = file.include_directory
      end
      if file.clear_include_directory ~= nil then
        fileMetadataState.include_directory = nil
      end
    end
  end
  return el
end

function currentFileMetadataState()
  return fileMetadataState
end


function resetFileMetadata()
  fileMetadataState = {
    file = nil,
    appendix = false,
    include_directory = nil,
  }
end


-- meta.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- constants
kHeaderIncludes = "header-includes"
kIncludeBefore = "include-before"
kIncludeAfter = "include-after"

function ensureIncludes(meta, includes)
  if not meta[includes] then
    meta[includes] = pandoc.List({})
  elseif pandoc.utils.type(meta[includes]) == "Inlines" or 
         pandoc.utils.type(meta[includes]) == "Blocks" then
    meta[includes] = pandoc.List({meta[includes]})
  end
end

function removeEmptyIncludes(meta, includes)
  if meta[includes] and 
     pandoc.utils.type(meta[includes]) == "List" and
     #meta[includes] == 0 then
    meta[includes] = nil
  end
end

function removeAllEmptyIncludes(meta)
  removeEmptyIncludes(meta, kHeaderIncludes)
  removeEmptyIncludes(meta, kIncludeBefore)
  removeEmptyIncludes(meta, kIncludeAfter)
end

-- add a header include as a raw block
function addInclude(meta, format, includes, include)
  if _quarto.format.isHtmlOutput() then
    blockFormat = "html"
  else
    blockFormat = format
  end  
  meta[includes]:insert(pandoc.Blocks({ pandoc.RawBlock(blockFormat, include) }))
end

-- conditionally include a package
function usePackage(pkg)
  return "\\@ifpackageloaded{" .. pkg .. "}{}{\\usepackage{" .. pkg .. "}}"
end

function usePackageWithOption(pkg, option)
  return "\\@ifpackageloaded{" .. pkg .. "}{}{\\usepackage[" .. option .. "]{" .. pkg .. "}}"
end

function metaInjectLatex(meta, func)
  if _quarto.format.isLatexOutput() then
    local function inject(tex)
      addInclude(meta, "tex", kHeaderIncludes, tex)
    end
    inject("\\makeatletter")
    func(inject)
    inject("\\makeatother")
  end
end

function metaInjectLatexBefore(meta, func)
  metaInjectRawLatex(meta, kIncludeBefore, func)
end

function metaInjectLatexAfter(meta, func)
  metaInjectRawLatex(meta, kIncludeAfter, func)
end

function metaInjectRawLatex(meta, include, func)
  if _quarto.format.isLatexOutput() then
    local function inject(tex)
      addInclude(meta, "tex", include, tex)
    end
    func(inject)
  end
end


function metaInjectHtml(meta, func)
  if _quarto.format.isHtmlOutput() then
    local function inject(html)
      addInclude(meta, "html", kHeaderIncludes, html)
    end
    func(inject)
  end
end


function readMetaOptions(meta) 
  local options = {}
  for key,value in pairs(meta) do
    if type(value) == "table" and value.clone ~= nil then
      options[key] = value:clone()
    else
      options[key] = value
    end 
  end
  return options
end
-- includes.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

local constants = require("modules/constants")

function read_includes(meta)
  -- return {
  --   Meta = function(meta)
      -- ensure all includes are meta lists
      ensureIncludes(meta, constants.kHeaderIncludes)
      ensureIncludes(meta, constants.kIncludeBefore)
      ensureIncludes(meta, constants.kIncludeAfter)
          
      -- read file includes
      readIncludeFiles(meta, constants.kIncludeInHeader, constants.kHeaderIncludes)
      readIncludeFiles(meta, constants.kIncludeBeforeBody, constants.kIncludeBefore)
      readIncludeFiles(meta, constants.kIncludeAfterBody, constants.kIncludeAfter)

      -- read text based includes
      readIncludeStrings(meta, constants.kHeaderIncludes)
      readIncludeStrings(meta, constants.kIncludeBefore)
      readIncludeStrings(meta, constants.kIncludeAfter)
     
      return meta
  --   end
  -- }
end

function readIncludeStrings(meta, includes)
  local strs = param(includes, {})
  for _,str in ipairs(strs) do
    if pandoc.utils.type(str) == "Blocks" then
      meta[includes]:insert(str)
    else
      if type(str) == "table" then
        str = inlinesToString(str)
      end
      addInclude(meta, FORMAT, includes, str)
    end
   
  end
end

function readIncludeFiles(meta, includes, target)

  -- process include files
  local files = param(includes, {})
  for _,file in ipairs(files) do

    local status, err = pcall(function () 
      -- read file contents
      local f = io.open(pandoc.utils.stringify(file), "rb")
      if f == nil then 
        fail("Error resolving " .. target .. "- unable to open file " .. file)
      end
      local contents = f:read("*all")
      f:close()
      -- write as as raw include
      addInclude(meta, FORMAT, target, contents)
    end)
  end

  
end
-- resourceRefs.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

local function handle_raw_element_resource_ref(el)
  if _quarto.format.isRawHtml(el) then
    local file = currentFileMetadataState().file
    if file ~= nil and file.resourceDir ~= nil then
      handlePaths(el, file.resourceDir, resourceRef)
      return el
    end
  end
end

function resourceRefs() 
  
  return {
    Image = function(el)
      local file = currentFileMetadataState().file
      if file ~= nil and file.resourceDir ~= nil then
        el.src = resourceRef(el.src, file.resourceDir)
      end
      return el
    end,

    RawInline = handle_raw_element_resource_ref,
    RawBlock = handle_raw_element_resource_ref,
  }
end
-- quarto-init.lua
-- Copyright (C) 2020-2023 Posit Software, PBC

-- required version
PANDOC_VERSION:must_be_at_least '2.13'



return {
  {
    Meta = read_includes
  },
  -- read_includes(),
  combineFilters({
    file_metadata(),
    resourceRefs()
  })
}


