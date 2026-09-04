-- mainstateinit.lua
-- initializes global state for the main.lua script
--
-- Copyright (C) 2022 by RStudio, PBC

-- global state
quarto_global_state = {
  usingBookmark = false,
  usingTikz = false,
  results = {
    resourceFiles = pandoc.List({}),
    inputTraits = {}
  },
  file = nil,
  appendix = false,
  fileSectionIds = {},
  emulatedNodeHandlers = {},
  reader_options = {}
}

crossref = {
  using_theorems = false,
  startAppendix = nil,

  -- initialize autolabels table
  autolabels = pandoc.List(),

  -- store a subfloat index to be able to lookup by id later.
  subfloats = {},

  -- kinds are "float", "block", "inline", "anchor"
  categories = {
    all = {
      {
        caption_location = "bottom",
        kind = "float",
        name = "Figure",
        prefix = "Figure",
        latex_env = "figure",
        ref_type = "fig",
      },
      {
        caption_location = "top",
        kind = "float",
        name = "Table",
        prefix = "Table",
        latex_env = "table",
        ref_type = "tbl",
      },
      {
        caption_location = "top",
        kind = "float",
        name = "Listing",
        prefix = "Listing",
        latex_env = "codelisting",
        ref_type = "lst",
      },

      -- callouts
      {
        kind = "Block",
        name = "Note",
        prefix = "Note",
        ref_type = "nte",
      },
      {
        kind = "Block",
        name = "Warning",
        prefix = "Warning",
        ref_type = "wrn",
      },
      {
        kind = "Block",
        name = "Caution",
        prefix = "Caution",
        ref_type = "cau",
      },
      {
        kind = "Block",
        name = "Tip",
        prefix = "Tip",
        ref_type = "tip",
      },
      {
        kind = "Block",
        name = "Important",
        prefix = "Important",
        ref_type = "imp", -- this will look weird but we decided to do it for consistency with the original callout types
      },

      -- proof envs
      {
        kind = "Block",
        name = "Proof",
        prefix = "Proof",
        ref_type = "prf",
      },
      {
        kind = "Block",
        name = "Remark",
        prefix = "Remark",
        ref_type = "rem",
      },
      {
        kind = "Block",
        name = "Solution",
        prefix = "Solution",
        ref_type = "sol",
      },
    }
    
    -- eventually we'll have other block kinds here, specifically theorem envs

    -- eventually we'll have inline kinds here
    -- with equation refs

    -- eventually we'll have anchor kinds here
    -- with section/chapter/slide refs, etc
  }
}


-- set up crossref category indices
function setup_crossref_category_indices()
  crossref.categories.by_ref_type = {}
  crossref.categories.by_name = {}
  for _, category in ipairs(crossref.categories.all) do
    crossref.categories.by_ref_type[category.ref_type] = category
    crossref.categories.by_name[category.name] = category
  end
end

function add_crossref_category(category)
  table.insert(crossref.categories.all, category)
  setup_crossref_category_indices()
end

setup_crossref_category_indices()
-- import_all.lua
-- imports all modules into _quarto.modules

_quarto.modules = {
  astshortcode = require("modules/astshortcode"),
  authors = require("modules/authors"),
  brand = require("modules/brand/brand"),
  callouts = require("modules/callouts"),
  classpredicates = require("modules/classpredicates"),
  constants = require("modules/constants"),
  dashboard = require("modules/dashboard"),
  filenames = require("modules/filenames"),
  filters = require("modules/filters"),
  jog = require("modules/jog"),
  license = require("modules/license"),
  lightbox = require("modules/lightbox"),
  mediabag = require("modules/mediabag"),
  openxml = require("modules/openxml"),
  patterns = require("modules/patterns"),
  scope = require("modules/scope"),
  string = require("modules/string"),
  tablecolwidths = require("modules/tablecolwidths"),
  typst = require("modules/typst"),
  listtable = require("modules/listtable"),
  tableutils = require("modules/tableutils"),
}

quarto.brand = _quarto.modules.brand
-- scopedwalk.lua
-- 
-- Copyright (C) 2024 Posit Software, PBC

-- unlike Pandoc's walk, this will mutate the nodes in place!
function scoped_walk(outer_node, filter)
  local function node_type(node)
    local pt = pandoc.utils.type(node)
    if pt == "Block" or pt == "Inline" then
      return node.t
    end
    return pt
  end

  local scope = pandoc.List({})
  -- needs to be defined here to allow corecursion
  local inner
  local function process_handler(handler, node)
    -- skip special nodes that should never be seen by filters
    if node.attributes and node.attributes.__quarto_custom_scaffold == "true" or
      node.identifier == _quarto.ast.vault._uuid then
      return nil, false
    end

    if handler then
      local result, recurse = handler(node, scope)
      if recurse == false then
        return result, true
      end
      if result ~= nil then
        scope:remove() -- scope is removed first here because `node` became `result`
        result = inner(result)
        scope:insert(nil) -- a dummy value to keep the scope management consistent
        return result, true
      end
    end
    return nil, false
  end  
  local function process_blocks(blocks)
    local result, done = process_handler(filter.Blocks, blocks)
    if done then
      return result or blocks
    end
    assert(result == nil)
    local i = 1
    local n = #blocks
    while i <= n do
      local block = blocks[i]
      local inner_r, rec = inner(block)
      if inner_r ~= nil then
        local inner_nt = pandoc.utils.type(inner_r)
        if inner_nt == "Block" then
          blocks[i] = inner_r
        elseif inner_nt == "Inline" then
          blocks[i] = pandoc.Plain(inner_r)
        elseif inner_nt == "Blocks" then
          blocks:remove(i)
          n = n - 1
          for ii, inner_block in ipairs(inner_r) do
            blocks:insert(i, inner_block)
            i = i + 1
            n = n + 1
          end
        elseif inner_nt == "Inlines" then
          blocks:remove(i)
          n = n - 1
          if #inner_nt > 0 then
            blocks[i] = pandoc.Plain(inner_r)
            i = i + 1
            n = n + 1
          end
        elseif inner_nt == "table" then
          blocks:remove(i)
          n = n - 1
          for ii, inner_block in ipairs(inner_r) do
            local inner_block_nt = pandoc.utils.type(inner_block)
            if inner_block_nt == "Block" then
              blocks:insert(i, inner_block)
            elseif inner_block_nt == "Inline" then
              blocks:insert(i, pandoc.Plain(inner_block))
            else
              fail("unexpected node type in table while adding to Blocks: " .. inner_block_nt)
            end
            i = i + 1
            n = n + 1
          end
        else
          fail("unexpected node type while handling blocks: " .. inner_nt)
        end
      end
      i = i + 1
    end
    return blocks
  end
  local function process_inlines(inlines)
    local result, done = process_handler(filter.Inlines, inlines)
    if done then
      return result or inlines
    end
    assert(result == nil)
    local i = 1
    local n = #inlines
    while i <= n do
      local block = inlines[i]
      local inner_r, rec = inner(block)
      if inner_r ~= nil then
        local inner_nt = pandoc.utils.type(inner_r)
        if inner_nt == "Inline" then
          inlines[i] = inner_r
        elseif inner_nt == "Block" then
          fail("unexpected block found in inlines")
        elseif inner_nt == "Blocks" then
          fail("unexpected blocks found in inlines")
        elseif inner_nt == "Inlines" then
          inlines:remove(i)
          n = n - 1
          for ii, inner_block in ipairs(inner_r) do
            inlines:insert(i, inner_block)
            i = i + 1
            n = n + 1
          end
        elseif inner_nt == "table" then
          inlines:remove(i)
          n = n - 1
          for ii, inner_block in ipairs(inner_r) do
            local inner_block_nt = pandoc.utils.type(inner_block)
            if inner_block_nt == "Inline" then
              inlines:insert(i, pandoc.Plain(inner_block))
            else
              fail("unexpected node type in table while adding to Inlines: " .. inner_block_nt)
            end
            i = i + 1
            n = n + 1
          end
        else
          fail("unexpected node type while handling inlines: " .. inner_nt)
        end
      end
      i = i + 1
    end
    return inlines
  end
  local has_only_blocks_content = {
    BlockQuote = true,
    Div = true,
    Note = true,
  }
  local has_only_inlines_content = {
    Plain = true,
    Para = true,
    Span = true,
    Header = true,
    Emph = true,
    Strong = true,
    Strikeout = true,
    Subscript = true,
    Superscript = true,
    SmallCaps = true,
    Quoted = true,
    Link = true,
    Underline = true,
  }
  local terminals = {
    Str = true,
    Space = true,
    SoftBreak = true,
    LineBreak = true,
    Code = true,
    Math = true,
    RawInline = true,
    CodeBlock = true,
    RawBlock = true,
    HorizontalRule = true,
    Null = true,
  }
  local function process_caption(caption)
    if caption.long then
      caption.long = process_blocks(caption.long)
    end
    if caption.short then
      caption.short = process_inlines(caption.short)
    end
  end
  local function process_content(node)
    local nt = node_type(node)
    
    -- recurse on the result or node's inner nodes
    if has_only_blocks_content[nt] then
      node.content = process_blocks(node.content)
      return node
    end
    if has_only_inlines_content[nt] then
      node.content = process_inlines(node.content)
      return node
    end
    if terminals[nt] then
      return node
    end
    -- now for the myriad special cases
    if nt == "Image" then
      node.caption = process_inlines(node.caption)
      return node
    end
    if nt == "BulletList" or nt == "OrderedList" then
      for i, c in ipairs(node.content) do
        node.content[i] = process_blocks(c)
      end
      return node
    end
    if nt == "Table" then
      local function process_list_of_rows(rows)
        for i, r in ipairs(rows) do
          for j, c in ipairs(r.cells) do
            c.content = process_blocks(c.content)
          end
        end
      end
      process_caption(node.caption)
      process_list_of_rows(node.head.rows)
      for i, b in ipairs(node.bodies) do
        process_list_of_rows(b.head)
        process_list_of_rows(b.body)
      end
      process_list_of_rows(node.foot.rows)
      return node
    end
    if nt == "DefinitionList" then
      for i, c in ipairs(node.content) do
        c[1] = process_inlines(c[1])
        for j, cc in ipairs(c[2]) do
          c[2][j] = process_blocks(cc)
        end
      end
      return node
    end
    if nt == "Figure" then
      process_caption(node.caption)
      node.content = process_blocks(node.content)
      return node
    end
    if nt == "LineBlock" then
      for i, c in ipairs(node.content) do
        node.content[i] = process_inlines(c)
      end
      return node
    end
    if nt == "Cite" then
      node.content = process_inlines(node.content)
      for i, c in ipairs(node.citations) do
        c.prefix = process_inlines(c.prefix)
        c.suffix = process_inlines(c.suffix)
      end
      return node
    end

    -- else
      quarto.utils.dump(node)
      fail("unexpected node type in handling content: " .. nt)
    -- end

    -- local ct = pandoc.utils.type(content)
    -- if ct == "Blocks" then
    --   process_blocks(content)
    -- elseif ct == "Inlines" then
    --   process_inlines(content)
    -- elseif ct == "List" then
    --   for i, c in ipairs(content) do
    --     local cct = pandoc.utils.type(c)
    --     if cct == "Blocks" then
    --       process_blocks(content)
    --     elseif cct == "Inlines" then
    --       process_inlines(content)
    --     else
    --       quarto.utils.dump(content)
    --       fail("unexpected node type in Block or Inline content: " .. cct)
    --     end
    --   end
    --   fail("unexpected node type in Block or Inline content: " .. cct)
    -- end
  end

  local function process_custom(node)
    local t = node.attributes.__quarto_custom_type
    local result, done = process_handler(filter[t] or filter.Custom, node)
    if done then
      return result
    end
    process_content(node)
    return node
  end
  local function process_block_or_inline(node, nt)
    local result, done = process_handler(filter[node.t] or filter[nt], node)
    if done then
      return result
    end
    process_content(node)
    return node
  end

  inner = function(node)
    scope:insert(node)
    local nt = pandoc.utils.type(node)
    local result
    if is_custom_node(node) then
      result = process_custom(node)
    elseif nt == "Block" or nt == "Inline" then
      result = process_block_or_inline(node, nt)
    elseif nt == "Blocks" then
      result = process_blocks(node)
    elseif nt == "Inlines" then
      result = process_inlines(node)
    else
      fail("unexpected node type: " .. nt)
    end

    scope:remove()
    return result
  end

  return inner(outer_node)
end
-- customnodes.lua
-- support for custom nodes in quarto's emulated ast
-- 
-- Copyright (C) 2023 Posit Software, PBC

local handlers = {}

local custom_node_data = pandoc.List({})
local n_custom_nodes = 0
local profiler = require('profiler')

function is_custom_node(node, name)
  if node.attributes and node.attributes.__quarto_custom == "true" then
    if name == nil or name == node.attributes.__quarto_custom_type then
      return node
    end
  end
  return false
end

function ensure_custom(node)
  if pandoc.utils.type(node) == "Block" or pandoc.utils.type(node) == "Inline" then
    local result = _quarto.ast.resolve_custom_data(node)
    return result or node -- it'll never be nil or false, but the lua analyzer doesn't know that
  end
  return node
end

-- use this instead of node.t == "Div" so that custom nodes
-- are not considered Divs
function is_regular_node(node, name)
  if type(node) ~= "userdata" then
    return false
  end
  if is_custom_node(node) then
    return false
  end
  if name ~= nil and node.t ~= name then
    return false
  end
  return node
end

function run_emulated_filter(doc, filter, traverser)
  if doc == nil then
    return nil
  end

  local state = quarto_global_state.extended_ast_handlers
  local needs_custom = false
  local sz = 0
  for k, v in pairs(filter) do
    sz = sz + 1
    if (k == "Custom" or 
        k == "CustomInline" or 
        k == "CustomBlock" or
        state.handlers.by_ast_name[k] ~= nil or
        -- we need custom handling to _avoid_ custom nodes as well.
        k == "Div" or
        k == "Span") then
      needs_custom = true
    end
  end

  local function checked_walk(node, filter_param)
    if node.walk == nil then
      if #node == 0 then -- empty node
        return node
      else
        -- luacov: disable
        quarto.utils.dump(node)
        internal_error()
        -- luacov: enable
      end
    end

    local old_traverse = _quarto.traverser
    if traverser == nil or traverser == 'pandoc' or traverser == 'walk' then
      _quarto.traverser = _quarto.utils.walk
    elseif traverser == 'jog' then
      _quarto.traverser = _quarto.modules.jog
    elseif type(traverser) == 'function' then
      _quarto.traverser = traverser
    else
      warn('Unknown traverse method: ' .. tostring(traverser))
    end
    local result = _quarto.traverser(node, filter_param)
    _quarto.traverser = old_traverse

    return result
  end

  -- performance: if filter is empty, do nothing
  if sz == 0 then
    return doc
  elseif sz == 1 then
    local result
    local t
    if filter.Pandoc then
      -- performance: if filter is only Pandoc, call that directly instead of walking.
      result = filter.Pandoc(doc) or doc
    elseif filter.Meta then
      -- performance: if filter is only Meta, call that directly instead of walking.
      t = pandoc.utils.type(doc)
      if t == "Pandoc" then
        local result_meta = filter.Meta(doc.meta) or doc.meta
        result = doc
        result.meta = result_meta
      else
        goto regular
      end
    else
      goto regular
    end
    if in_filter then
      profiler.category = ""
    end
    return result
  end


  ::regular::

  -- if user passed a table corresponding to the custom node instead 
  -- of the custom node, then first we will get the actual node
  if doc.__quarto_custom_node ~= nil then
    doc = doc.__quarto_custom_node
    needs_custom = true
  end

  local is_custom = is_custom_node(doc)
  if not needs_custom or (not is_custom and filter._is_wrapped) then
    if doc.walk == nil then
      if #doc == 0 then -- empty doc
        return doc
      else
        -- luacov: disable
        internal_error()
        -- luacov: enable
      end
    end
    local result, recurse = checked_walk(doc, filter)
    if in_filter then
      profiler.category = ""
    end
    return result, recurse
  end
  -- assert: needs_custom and (is_custom or not filter._is_wrapped)

  local wrapped_filter = {
    _is_wrapped = true
  }

  for k, v in pairs(filter) do
    wrapped_filter[k] = v
  end

  local function process_custom_preamble(custom_data, t, kind, custom_node)
    if custom_data == nil then
      return nil
    end
    local node_type = {
      Block = "CustomBlock",
      Inline = "CustomInline"
    }
    local filter_fn = filter[t] or filter[node_type[kind]] or filter.Custom
    if filter_fn ~= nil then
      local result, recurse = filter_fn(custom_data, custom_node)
      if result == nil then
        return nil, recurse
      end
      -- do the user a kindness and unwrap the result if it's a custom node
      if type(result) == "table" and result.__quarto_custom_node ~= nil then
        return result.__quarto_custom_node, recurse
      end
      return result, recurse
    end
  end

  function wrapped_filter.Div(node)
    if is_custom_node(node) then
      local custom_data, t, kind = _quarto.ast.resolve_custom_data(node)
      -- here, if the node is actually an inline,
      -- it's ok, because Pandoc will wrap it in a Plain
      return process_custom_preamble(custom_data, t, kind, node)
    end
    if node.attributes.__quarto_custom_scaffold == "true" then
      return nil
    end
    if node.identifier == _quarto.ast.vault._uuid then
      return nil
    end
    if filter.Div ~= nil then
      return filter.Div(node)
    end
    return nil
  end

  function wrapped_filter.Span(node)
    if is_custom_node(node) then
      local custom_data, t, kind = _quarto.ast.resolve_custom_data(node)
      -- only follow through if node matches the expected kind
      if kind == "Inline" then
        return process_custom_preamble(custom_data, t, kind, node)
      end
      -- luacov: disable
      fatal("Custom node of type " .. t .. " is not an inline, but found in an inline context")
      return nil
      -- luacov: enable
    end
    if node.attributes.__quarto_custom_scaffold == "true" then
      return nil
    end
    if filter.Span ~= nil then
      return filter.Span(node)
    end
    return nil
  end

  if is_custom then
    local custom_data, t, kind = _quarto.ast.resolve_custom_data(doc)
    local result, recurse = process_custom_preamble(custom_data, t, kind, doc)
    if in_filter then
      profiler.category = ""
    end
    if result ~= nil then
      doc = result
    end
    if recurse == false then
      return doc, recurse
    end
  end
  return checked_walk(doc, wrapped_filter)
end

function create_custom_node_scaffold(t, context)
  local result
  if context == "Block" then
    result = pandoc.Div({})
  elseif context == "Inline" then
    result = pandoc.Span({})
  else
    -- luacov: disable
    fatal("Invalid context for custom node: " .. context)
    -- luacov: enable
  end
  n_custom_nodes = n_custom_nodes + 1
  local id = tostring(n_custom_nodes)
  result.attributes.__quarto_custom = "true"
  result.attributes.__quarto_custom_type = t
  result.attributes.__quarto_custom_context = context
  result.attributes.__quarto_custom_id = id

  return result
end

function create_emulated_node(t, tbl, context, forwarder)
  local result = create_custom_node_scaffold(t, context)
  tbl.t = t -- set t always to custom ast type
  local id = result.attributes.__quarto_custom_id

  custom_node_data[id] = _quarto.ast.create_proxy_accessor(result, tbl, forwarder)
  return result, custom_node_data[id]
end

_quarto.ast = {
  vault = {
    _uuid = "3ade8a4a-fb1d-4a6c-8409-ac45482d5fc9",

    _added = {},
    _removed = {},
    add = function(id, contents)
      _quarto.ast.vault._added[id] = contents
    end,
    remove = function(id)
      _quarto.ast.vault._removed[id] = true
    end,
    locate = function(doc)
      if doc == nil then
        doc = _quarto.ast._current_doc
      end
      -- attempt a fast lookup first
      if #doc.blocks > 0 and doc.blocks[#doc.blocks].identifier == _quarto.ast.vault._uuid then
        return doc.blocks[#doc.blocks]
      else
        -- otherwise search for it
        for _, block in ipairs(doc.blocks) do
          if block.identifier == _quarto.ast.vault._uuid then
            return block
          end
        end
      end
      return nil
    end,  
  },
  custom_node_data = custom_node_data,
  create_custom_node_scaffold = create_custom_node_scaffold,

  grow_scaffold = function(node, size)
    local n = #node.content
    local ctor = pandoc[node.t or pandoc.utils.type(node)]
    for _ = n + 1, size do
      local scaffold = ctor({})
      scaffold.attributes.__quarto_custom_scaffold = "true"
      node.content:insert(scaffold)
    end
  end,

  create_proxy_metatable = function(forwarder, node_accessor)
    node_accessor = node_accessor or function(table)
      return table["__quarto_custom_node"]
    end
    return {
      __index = function(table, key)
        local index = forwarder(key)
        if index == nil then
          return rawget(table, key)
        end
        local node = node_accessor(table)
        local content = node.content
        if index > #content then
          return nil
        end
        local result = content[index]
        if result == nil then
          return nil
        end
        local t = result.t
        -- if not (t == "Div" or t == "Span") then
        --   warn("Custom node content is not a Div or Span, but a " .. t)
        --   return nil
        -- end
        local content = result.content
        if content == nil then
          return nil
        end
        local n = #content
        if n == 0 then
          return nil
        elseif n ~= 1 then
          return content
        else
          return content[1]
        end
      end,
      __newindex = function(table, key, value)
        local index = forwarder(key)
        if index == nil then
          rawset(table, key, value)
          return
        end
        local node = node_accessor(table)
        local valtype = pandoc.utils.type(value)
        quarto_assert(valtype ~= 'Div' and valtype ~= 'Span', "")
        if index > #node.content then
          _quarto.ast.grow_scaffold(node, index)
        end
        local inner_node = node.content[index]
        local innertype = pandoc.utils.type(inner_node)
        if innertype == 'Block' then
          inner_node.content = quarto.utils.as_blocks(value)
        elseif innertype == 'Inline' then
          inner_node.content = quarto.utils.as_inlines(value)
        else
          warn(debug.traceback(
                 'Cannot find the right content type for value ' .. valtype))
          inner_node.content = value
        end
      end
    }
  end,

  create_proxy_accessor = function(div_or_span, custom_data, forwarder)
    if forwarder == nil then
      return custom_data
    end

    local proxy = {
      __quarto_custom_node = div_or_span
    }
    setmetatable(proxy, _quarto.ast.create_proxy_metatable(function(key)
      return forwarder[key]
    end))

    for k, v in pairs(custom_data) do
      proxy[k] = v
    end
    return proxy
  end,

  resolve_custom_data = function(div_or_span)
    if (div_or_span == nil or
        div_or_span.attributes == nil or 
        div_or_span.attributes.__quarto_custom ~= "true") then
      return
    end

    local t = div_or_span.attributes.__quarto_custom_type
    local n = div_or_span.attributes.__quarto_custom_id
    local kind = div_or_span.attributes.__quarto_custom_context
    local handler = _quarto.ast.resolve_handler(t)
    -- luacov: disable
    if handler == nil then
      fatal("Internal Error: handler not found for custom node " .. t)
    end
    -- luacov: enable
    local custom_data = _quarto.ast.custom_node_data[n]
    custom_data["__quarto_custom_node"] = div_or_span

    return custom_data, t, kind
  end,
  
  add_handler = function(handler)
    local state = quarto_global_state.extended_ast_handlers
    if type(handler.constructor) == "nil" then
      -- luacov: disable
      quarto.utils.dump(handler)
      fatal("Internal Error: extended ast handler must have a constructor")
      -- luacov: enable
    elseif type(handler.class_name) == "nil" then
      -- luacov: disable
      quarto.utils.dump(handler)
      fatal("handler must define class_name")
      -- luacov: enable
    elseif type(handler.class_name) == "string" then
      state.handlers[handler.kind][handler.class_name] = handler
    elseif type(handler.class_name) == "table" then
      for _, name in ipairs(handler.class_name) do
        state.handlers[handler.kind][name] = handler
      end
    else
      -- luacov: disable
      quarto.utils.dump(handler)
      fatal("ERROR: class_name must be a string or an array of strings")
      -- luacov: enable
    end

    local forwarder
    if tisarray(handler.slots) then
      forwarder = pandoc.List{}
      for i, slot in ipairs(handler.slots) do
        forwarder[slot] = i
      end
    elseif handler.slots ~= nil then
      warn('Expected `slots` to be either an array or nil, got ' ..
           tostring(handler.slots))
    end

    quarto[handler.ast_name] = function(params)
      local tbl, need_emulation = handler.constructor(params)

      if need_emulation ~= false then
        return create_emulated_node(handler.ast_name, tbl, handler.kind, forwarder)
      else
        tbl.t = handler.ast_name -- set t always to custom ast type
        custom_node_data[tbl.__quarto_custom_node.attributes.__quarto_custom_id] = tbl
        return tbl.__quarto_custom_node, tbl
      end
    end

    -- we also register them under the ast_name so that we can render it back
    state.handlers.by_ast_name[handler.ast_name] = handler
  end,

  add_renderer = function(name, condition, renderer)
    if renderer == nil then
      -- luacov: disable
      fatal("Internal Error in add_renderer: renderer for " .. name .. " is nil")
      -- luacov: enable
    end

    local handler = _quarto.ast.resolve_handler(name)
    if handler == nil then
      -- luacov: disable
      fatal("Internal Error in add_renderer: handler not found for custom node " .. name)
      -- luacov: enable
    end
    if handler.renderers == nil then
      handler.renderers = { }
    end
    -- we insert renderers at the beginning of the list so that they have
    -- a chance to gtrigger before the default ones
    table.insert(handler.renderers, 1, { condition = condition, render = renderer })
  end,

  -- find handler by name in given table, or in the by_ast_name table if no table
  -- is specified.
  resolve_handler = function(name, key)
    local state = quarto_global_state.extended_ast_handlers
    local handlers = state.handlers[key or 'by_ast_name']
    if handlers ~= nil then
      return handlers[name]
    end
    -- TODO: should we just fail here? We seem to be failing downstream of every nil
    -- result anyway.
    -- luacov: disable
    return nil
    -- luacov: enable
  end,

  -- wrap an element with another element containing the quarto-scaffold class
  -- so that it will be stripped out in the final output
  scaffold_element = function(node)
    local pt = pandoc.utils.type(node)
    if pt == "Blocks" then
      return pandoc.Div(node, {"", {"quarto-scaffold"}})
    elseif pt == "Inlines" then
      return pandoc.Span(node, {"", {"quarto-scaffold"}})
    else
      return node
    end
  end,

  -- a slightly different version of scaffold_element; we should probably unify these
  make_scaffold = function(ctor, node)
    return ctor(node or {}, pandoc.Attr("", {"quarto-scaffold", "hidden"}, {}))
  end,
  
  scoped_walk = scoped_walk,

  walk = run_emulated_filter,

  writer_walk = function(doc, filter)
    local old_custom_walk = filter.Custom
    local function custom_walk(node)
      local handler = quarto._quarto.ast.resolve_handler(node.t)
      if handler == nil then
        -- luacov: disable
        fatal("Internal Error: handler not found for custom node " .. node.t)
        -- luacov: enable
      end
      if handler.render == nil then
        -- luacov: disable
        fatal("Internal Error: handler for custom node " .. node.t .. " does not have a render function")
        -- luacov: enable
      end
      return handler.render(node)
    end

    if filter.Custom == nil then
      filter.Custom = custom_walk
    end

    local result = run_emulated_filter(doc, filter)
    filter.Custom = old_custom_walk
    return result
  end
}

quarto._quarto = _quarto

function construct_extended_ast_handler_state()
  local state = {
    handlers = {
      Inline = {},      -- Inline handlers by class name
      Block = {},       -- Block handlers by class name
      by_ast_name = {}, -- All handlers by Ast name
    },
  }

  if quarto_global_state ~= nil then
    quarto_global_state.extended_ast_handlers = state
  end

  -- we currently don't have any handlers at startup,
  -- so we disable coverage for this block
  -- luacov: disable
  for _, handler in ipairs(handlers) do
    _quarto.ast.add_handler(handler)
  end
  -- luacov: enable
end

construct_extended_ast_handler_state()
-- emulatedfilter.lua
-- creates lua filter loaders to support emulated AST
--
-- Copyright (C) 2022 by RStudio, PBC

local function plain_loader(handlers)
  local function wrapFilter(handler)
    local wrappedFilter = {}
    wrappedFilter.scriptFile = handler.scriptFile
    for k, v in pairs(handler) do
      wrappedFilter[k] = v.handle
    end
    return wrappedFilter
  end
  return map_or_call(wrapFilter, handlers)
end

make_wrapped_user_filters = function(filterListName)
  local filters = {}
  for _, v in ipairs(param("quarto-filters")[filterListName]) do
    if (type(v) == "string" and string.match(v, ".lua$") == nil) then
      v = {
        path = v,
        type = "json"
      }
    end
    local wrapped = makeWrappedFilter(v, plain_loader)
    if tisarray(wrapped) then
      for _, innerWrapped in ipairs(wrapped) do
        table.insert(filters, innerWrapped)
      end
    else
      table.insert(filters, wrapped)
    end
  end
  return filters
end

inject_user_filters_at_entry_points = function(filter_list)
  local find_index_of_entry_point = function (entry_point)
    return select(2, pandoc.List.find_if(filter_list,
      function (f) return f.name == entry_point end))
  end
  local entry_point_counts = {}
  for _, v in ipairs(param("quarto-filters").entryPoints) do
    local entry_point = v["at"] -- FIXME entry_point or entryPoint
    if entry_point_counts[entry_point] == nil then
      entry_point_counts[entry_point] = 0
    end
    entry_point_counts[entry_point] = entry_point_counts[entry_point] + 1

    local wrapped = makeWrappedFilter(v, plain_loader)
    local is_many_filters = tisarray(wrapped)

    local index = find_index_of_entry_point(entry_point)
    if index == nil then
      warn("filter entry point " .. entry_point .. " not found in filter list")
      warn("Will use pre-quarto entry point instead")
      index = find_index_of_entry_point("pre-quarto")
      if index == nil then
        internal_error()
        return
      end
    end

    local filter = {
      name = entry_point .. "-user-" .. tostring(entry_point_counts[entry_point]),
      -- The filter might not work as expected when doing a non-lazy jog, so
      -- make sure it is processed with the default 'walk' function.
      traverser = 'walk',
    }
    if is_many_filters then
      filter.filters = wrapped
    else
      filter.filter = wrapped
    end
    table.insert(filter_list, index, filter)
  end
end
-- parse.lua
-- convert custom div inputs to custom nodes
--
-- Copyright (C) 2022 by RStudio, PBC

local function parse(node, kind)
  for _, class in ipairs(node.attr.classes) do
    local tag = pandoc.utils.stringify(class)
    local handler = _quarto.ast.resolve_handler(tag, kind)
    if handler ~= nil then
      return handler.parse(node)
    end
  end
  return node
end

local function parse_inline(node)
  return parse(node, 'Inline')
end

local function parse_block(node)
  return parse(node, 'Block')
end

function parse_extended_nodes() 
  return {
    Div = parse_block,
    Span = parse_inline,
  }
end
-- render.lua
-- convert custom nodes to their final representation
--
-- Copyright (C) 2022 by RStudio, PBC

function render_extended_nodes()
  local function has_custom_nodes(node)
    local has_custom_nodes = false
    _quarto.ast.walk(node, {
      Custom = function()
        has_custom_nodes = true
      end
    })
    return has_custom_nodes
  end

  local filter

  local function render_custom(node)
    local function postprocess_render(render_result)
      -- we need to recurse in case custom nodes render to other custom nodes
      if is_custom_node(render_result) then
        -- recurse directly
        return render_custom(render_result)
      elseif has_custom_nodes(render_result) then
        -- recurse via the filter
        return _quarto.ast.walk(render_result, filter)
      else
        return render_result
      end
    end
    if type(node) == "userdata" then
      node = _quarto.ast.resolve_custom_data(node)
    end

    local handler = _quarto.ast.resolve_handler(node.t)
    if handler == nil then
      -- luacov: disable
      fatal("Internal Error: handler not found for custom node " .. node.t)
      -- luacov: enable
    end
    local scaffold = _quarto.ast.scaffold_element
    if handler.renderers then
      for _, renderer in ipairs(handler.renderers) do
        if renderer.condition(node) then
          return scaffold(postprocess_render(scaffold(renderer.render(node))))
        end
      end
      -- luacov: disable
      fatal("Internal Error: renderers table was exhausted without a match for custom node " .. node.t)
      -- luacov: enable
    elseif handler.render ~= nil then
      return scaffold(postprocess_render(scaffold(handler.render(node))))
    else
      -- luacov: disable
      fatal("Internal Error: handler for custom node " .. node.t .. " does not have a render function or renderers table")
      -- luacov: enable
    end
  end

  filter = {
    Custom = render_custom
  }
  return filter
end
-- runemulation.lua
-- run filters in pandoc emulation mode
--
-- Copyright (C) 2022 by RStudio, PBC

local profiler = require('profiler')

-- locate or create the quarto vault,
-- inserting the just-added nodes if needed, and mutating doc
local ensure_vault = function(doc)
  local vault = _quarto.ast.vault.locate(doc)
 
  -- create if missing
  if vault == nil then
    vault = pandoc.Div({}, pandoc.Attr(_quarto.ast.vault._uuid, {"hidden"}, {}))
    doc.blocks:insert(vault)
  end

  for k, v in pairs(_quarto.ast.vault._added) do
    local div = pandoc.Div(quarto.utils.as_blocks(v), pandoc.Attr(k, {}, {}))
    vault.content:insert(div)
  end
  vault.content = _quarto.ast.walk(vault.content, {
    Div = function(div)
      if _quarto.ast.vault._removed[div.identifier] then
        return {}
      end
    end
  }) or pandoc.Blocks({}) -- to satisfy the Lua analyzer

  _quarto.ast.vault._added = {}
  _quarto.ast.vault._removed = {}
end

local function remove_vault(doc)
  -- attempt a fast lookup first
  if #doc.blocks > 0 and doc.blocks[#doc.blocks].identifier == _quarto.ast.vault._uuid then
    doc.blocks:remove(#doc.blocks)
  else
    -- otherwise search for it
    for i, block in ipairs(doc.blocks) do
      if block.identifier == _quarto.ast.vault._uuid then
        doc.blocks:remove(i)
        break
      end
    end
  end
end

local function run_emulated_filter_chain(doc, filters, afterFilterPass, profiling)
  init_trace(doc)
  for i, v in ipairs(filters) do
    local function callback()
      if v.flags then
        if type(v.flags) ~= "table" then
          -- luacov: disable
          fatal("filter " .. v.name .. " has invalid flags")
          -- luacov: enable
        end
        local can_skip = true
        for _, index in ipairs(v.flags) do
          if flags[index] == true then
            can_skip = false
          end
        end
        if can_skip then
          return
        end
      end

      -- We don't seem to need coverage for profiling
      -- luacov: disable
      if profiling then
        profiler.setcategory(v.name)
      end
      -- luacov: enable

      if v.print_ast then
        print(pandoc.write(doc, "native"))
      else
        _quarto.ast._current_doc = doc
        doc = run_emulated_filter(doc, v.filter, v.traverser)
        ensure_vault(doc)

        add_trace(doc, v.name)

        -- luacov: disable
        if profiling then
          profiler.category = ""
        end
        if os.getenv("QUARTO_FLUSH_TRACE") then
          end_trace()
        end
        -- luacov: enable
      end
    end
    if v.filter and v.filter.scriptFile then
      _quarto.withScriptFile(v.filter.scriptFile, callback)
    else
      callback()
    end
    if afterFilterPass then
      afterFilterPass()
    end
  end
  end_trace()
  remove_vault(doc)
  return doc
end

local function emulate_pandoc_filter(filters, afterFilterPass)
  local cached_paths
  local profiler

  -- luacov: disable
  local function get_paths(tmpdir)
    if cached_paths then
      return cached_paths
    end
    os.execute("quarto --paths > " .. tmpdir .. "paths.txt")
    local paths_file = io.open(tmpdir .. "paths.txt", "r")
    if paths_file == nil then
      error("couldn't open paths file")
    end
    cached_paths = paths_file:read("l")
    paths_file:close()
    return cached_paths
  end
  -- luacov: enable
  
  return {
    traverse = 'topdown',
    Pandoc = function(doc)
      local profiling = option("lua-profiler-output", false) or param("lua-profiler-output", false)
      if not profiling then
        return run_emulated_filter_chain(doc, filters, afterFilterPass), false
      end
      profiling = pandoc.utils.stringify(profiling)
      -- luacov: disable
      if profiler == nil then
        profiler = require('profiler')
      end
      pandoc.system.with_temporary_directory("temp", function(tmpdir)
        profiler.start(tmpdir .. "/prof.txt", tonumber(option("lua-profiler-interval-ms", "5")))
        doc = run_emulated_filter_chain(doc, filters, afterFilterPass, profiling)
        profiler.stop()
        -- os.execute("cp " .. tmpdir .. "/prof.txt /tmp/prof.out")
        local ts_source = get_paths(tmpdir) .. "/../../../tools/profiler/convert-to-perfetto.ts"
        os.execute("quarto run " .. ts_source .. " " .. tmpdir .. "/prof.txt > " .. profiling)
        return nil
      end)
      return doc, false
      -- luacov: enable
    end
  }
end

function run_as_extended_ast(specTable)

  local function coalesce_filters(filterList)
    local finalResult = {}
  
    for i, v in ipairs(filterList) do
      if v.filter ~= nil or v.print_ast then
        -- v.filter._filter_name = v.name
        table.insert(finalResult, v)
      elseif v.filters ~= nil then
        for j, innerV in pairs(v.filters) do
          innerV._filter_name = string.format("%s-%s", v.name, j)
          table.insert(finalResult, {
            filter = innerV,
            name = innerV._filter_name,
            flags = v.flags
          })
        end
      else
        -- luacov: disable
        warn("filter " .. v.name .. " didn't declare filter or filters.")
        -- luacov: enable
      end
    end
  
    return finalResult
  end

  specTable.filters = coalesce_filters(specTable.filters)

  local pandocFilterList = {}
  if specTable.pre then
    for _, v in ipairs(specTable.pre) do
      table.insert(pandocFilterList, v)
    end
  end

  table.insert(pandocFilterList, emulate_pandoc_filter(
    specTable.filters,
    specTable.afterFilterPass
  ))

  if specTable.post then
    for _, v in ipairs(specTable.post) do
      table.insert(pandocFilterList, v)
    end
  end

  return pandocFilterList
end
-- traceexecution.lua
-- produce a json file from filter chain execution
--
-- Copyright (C) 2022 by RStudio, PBC

local data = {}

-- don't test coverage for filter tracing
-- TODO but maybe we should?
-- 
-- luacov: disable
if os.getenv("QUARTO_TRACE_FILTERS") then
  function init_trace(doc)
    table.insert(data, {
      state = "__start",
      doc = quarto.json.decode(pandoc.write(doc, "json"))
    })
  end

  function add_trace(doc, filter_name)
    local function safe_json(value)
      local t = type(value)
      if t == "table" then
        local result = {}
        for k,v in pairs(value) do
          result[k] = safe_json(v)
        end
        return result
      elseif t == "userdata" then
        return nil -- skip pandoc values entirely
      else
        return value
      end
    end
    doc = _quarto.ast.walk(doc, {
      Custom = function(custom)
        local div = custom.__quarto_custom_node
        local custom_table = quarto.json.encode(safe_json(custom))
        div.attributes["__quarto_custom_table"] = custom_table
        return div
      end
    })
    if doc == nil then
      fatal("Unable to encode document as json")
    end
    table.insert(data, {
      state = filter_name,
      doc = quarto.json.decode(pandoc.write(doc, "json"))
    })
  end

  function end_trace()
    local tracefile = os.getenv("QUARTO_TRACE_FILTERS")
    if tracefile == "true" then
      tracefile = "quarto-filter-trace.json"
    end
    local file = io.open(tracefile, "w")
    if file == nil then
      fatal("Unable to open quarto-filter-trace.json for writing")
    end
    file:write(quarto.json.encode({
      data = data
    }))
    file:close()
  end
else
  function init_trace(doc)
  end
  function add_trace(doc, filter_name)
  end
  function end_trace()
  end
end

-- luacov: enable
-- wrappedwriter.lua
-- support for creating better custom writers
--
-- Copyright (C) 2022 by RStudio, PBC

function wrapped_writer()
  return filterIf(function()
    return param("custom-writer")
  end, makeWrappedFilter(param("custom-writer"), function(handler)
    local resultingStrs = {}
  
    local contentHandler = function(el)
      return el.content
    end
  
    local bottomUpWalkers = {
      Pandoc = function(doc)
        local result = {}
        if doc.blocks then
          for _, block in ipairs(doc.blocks) do
            table.insert(result, block)
          end
        end
        -- TODO I think we shouldn't walk meta, but I'm not positive.
        -- if doc.meta then
        --   table.insert(result, doc.meta)
        -- end
        return result
      end,
      BlockQuote = contentHandler,
      BulletList = contentHandler,
  
      DefinitionList = contentHandler,
  
      Div = contentHandler,
      Header = contentHandler,
      LineBlock = contentHandler,
      OrderedList = contentHandler,
      Para = contentHandler,
      Plain = contentHandler,
  
      Cite = function(element)
        local result = {}
        for _, block in ipairs(element.content) do
          table.insert(result, block)
        end
        for _, block in ipairs(element.citations) do
          table.insert(result, block)
        end
        return result
      end,
  
      Emph = contentHandler,
      Figure = function(element)
        local result = {}
        for _, block in ipairs(element.content) do
          table.insert(result, block)
        end
        table.insert(result.caption)
        return result
      end,
      Image = function(element)
        return element.caption
      end,
      Link = contentHandler,
      Note = contentHandler,
      Quoted = contentHandler,
      SmallCaps = contentHandler,
      Span = contentHandler,
      Strikeout = contentHandler,
      Strong = contentHandler,
      Subscript = contentHandler,
      Superscript = contentHandler,
      Underline = contentHandler,
  
      -- default simple behavior
      Str = function(s)
        return { s.text }
      end,
      Space = function() return { " " } end,
      LineBreak = function() return { "\n" } end,
      SoftBreak = function() return { "\n" } end,
      Inlines = function(inlines)
        return inlines
      end,
      Blocks = function(blocks)
        return blocks
      end,
      RawInline = function(inline)
        local tbl, t = _quarto.ast.resolve_custom_data(inline)
        if tbl == nil then 
          return {}
        end
        local handler = _quarto.ast.resolve_handler(t)
        if handler == nil then
          return {}
        end
        local result = pandoc.List({})
        for _, v in ipairs(handler.inner_content(tbl)) do
          result:extend(v)
        end
        return result
      end
    }
  
    local function handleBottomUpResult(v)
      if type(v) == "string" then
        table.insert(resultingStrs, v)
      elseif type(v) == "userdata" then
        bottomUp(v)
      elseif tisarray(v) then
        for _, inner in ipairs(v) do
          bottomUp(v)
        end
      end
    end
    local bottomUp
  
    bottomUp = function(node)
      if type(node) == "string" then
        table.insert(resultingStrs, node)
        return nil
      end
      local t
      if type(node) == "userdata" then
        local tbl
        tbl, t = _quarto.ast.resolve_custom_data(node)
        if tbl ~= nil then 
          local astHandler = _quarto.ast.resolve_handler(t)
          if astHandler == nil then
            -- luacov: disable
            fatal("Internal error: no handler for " .. t)
            -- luacov: enable
          end
          local nodeHandler = astHandler and handler[astHandler.ast_name] and handler[astHandler.ast_name].handle
          if nodeHandler == nil then
            local inner = astHandler.inner_content(tbl)
            for _, v in pairs(inner) do
              bottomUp(v)
            end
          else
            handleBottomUpResult(nodeHandler(tbl, bottomUp, node))
          end
        else
          local nodeHandler
          t = node.t or pandoc.utils.type(node)
          nodeHandler = handler[t] and handler[t].handle
          if nodeHandler == nil then 
            -- no handler, just walk the internals in some default order
            if bottomUpWalkers[t] then
              for _, v in ipairs(bottomUpWalkers[t](node)) do
                bottomUp(v)
              end
            else
              for _, v in pairs(node) do
                bottomUp(v)
              end
            end
          else
            handleBottomUpResult(nodeHandler(node, bottomUp))
          end
        end
      else
        -- allow
        t = type(node)
        local nodeHandler = handler[t]
        if nodeHandler ~= nil then
          handleBottomUpResult(nodeHandler(node, bottomUp))
        end
        if tisarray(node) then
          for _, v in ipairs(node) do
            bottomUp(v)
          end
        end
        -- do nothing if no handler for builtin type        
      end
    
      return nil
    end
  
    local wrappedFilter = {
      Pandoc = function(doc)
        local strs
        if handler.Writer then
          strs = handler.Writer.handle(doc)
        else
          bottomUp(doc)
          strs = table.concat(resultingStrs, "")
        end
        return pandoc.Pandoc(pandoc.Blocks(pandoc.RawBlock("markdown", strs .. "\n")))
      end
    }
    return wrappedFilter
  end))
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
-- citation.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- read and replace the citation field
-- with reshaped data that has been 
-- restructured into the standard has
-- format

local constants = require("modules/constants")

local function processTypedId(el) 
  if pandoc.utils.type(el) == "Inlines" then
    return { value = el }
  else
    return el    
  end
end

local function normalizeTypedId(els)
  if pandoc.utils.type(els) == "List" then
    -- this is a list of ids
    local normalizedEls = {}
    for i,v in ipairs(els) do        
      local normalized = processTypedId(v)
      tappend(normalizedEls, {normalized})
    end
    return normalizedEls
  elseif pandoc.utils.type(els) == "Inlines" then
    -- this is a simple id (a string)
    return { processTypedId(els )}
  else
    -- this is a single id, but is already a typed id
    return { processTypedId(els) }
  end
end

function processCitationMeta(meta)
  if meta then
    local citationMeta = meta[constants.kCitation]
    if citationMeta and type(citationMeta) == "object" then
      local containerIds = citationMeta[constants.kContainerId]
      if containerIds ~= nil then
        meta[constants.kCitation][constants.kContainerId] = normalizeTypedId(containerIds)
      end

      local articleIds = citationMeta[constants.kArticleId]
      if articleIds ~= nil then
        meta[constants.kCitation][constants.kArticleId] = normalizeTypedId(articleIds)
      end

      if citationMeta[constants.kPage] and citationMeta[constants.kPageFirst] == nil and citationMeta[constants.kPageLast] == nil then
        local pagerange = split(pandoc.utils.stringify(citationMeta[constants.kPage]), '-')
        meta[constants.kCitation][constants.kPageFirst] = pandoc.Inlines(pagerange[1])
        if pagerange[2] then
          meta[constants.kCitation][constants.kPageLast] = pandoc.Inlines(pagerange[2])
        end
      end
    end
    return meta
  end
end

-- colors.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- These colors are used as background colors with an opacity of 0.75
kColorUnknown = "909090"
kColorNote = "0758E5"
kColorImportant = "CC1914"
kColorWarning = "EB9113"
kColorTip = "00A047"
kColorCaution = "FC5300"

-- these colors are used with no-opacity
kColorUnknownFrame = "acacac"
kColorNoteFrame = "4582ec"
kColorImportantFrame = "d9534f"
kColorWarningFrame = "f0ad4e"
kColorTipFrame = "02b875"
kColorCautionFrame = "fd7e14"

kBackgroundColorUnknown = "e6e6e6"
kBackgroundColorNote = "dae6fb"
kBackgroundColorImportant = "f7dddc"
kBackgroundColorWarning = "fcefdc"
kBackgroundColorTip = "ccf1e3"
kBackgroundColorCaution = "ffe5d0"

function latexXColor(color) 
  -- remove any hash at the front
  color = pandoc.utils.stringify(color)
  color = color:gsub("#","")

  local hexCount = 0
  for match in color:gmatch "%x%x" do
    hexCount = hexCount + 1
  end

  if hexCount == 3 then
    -- this is a hex color
    return "{HTML}{" .. color .. "}"
  else
    -- otherwise treat it as a named color
    -- and hope for the best
    return '{named}{' .. color .. '}' 
  end
end

-- converts a hex string to a RGB
function hextoRgb(hex)
  -- remove any leading #
  hex = hex:gsub("#","")

  -- convert to 
  return {
    red = tonumber("0x"..hex:sub(1,2)), 
    green = tonumber("0x"..hex:sub(3,4)), 
    blue = tonumber("0x"..hex:sub(5,6))
  }
end

-- collate.lua
-- Copyright (C) 2023 Posit Software, PBC

-- improved formatting for dumping tables
function collate(lst, predicate)
  local result = pandoc.List({})
  local current_block = pandoc.List({})
  for _, block in ipairs(lst) do
    if #current_block == 0 then
      current_block = pandoc.List({ block })
    else
      if predicate(block, current_block[#current_block]) then
        current_block:insert(block)
      else
        if #current_block > 0 then
          result:insert(current_block)
        end
        current_block = pandoc.List({ block })
      end
    end
  end
  if #current_block > 0 then
    result:insert(current_block)
  end
  return result
end
-- crossref.lua
-- Copyright (C) 2023 Posit Software, PBC
--
-- common crossref functions/data

function add_crossref(label, type, title)
  if pandoc.utils.type(title) ~= "Blocks" then
    title = quarto.utils.as_blocks(title)
  end
  local order = indexNextOrder(type)
  indexAddEntry(label, nil, order, title)
  return order
end
-- debug.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- improved formatting for dumping tables
function tdump (tbl, indent, refs)
  if not refs then refs = {} end
  if not indent then indent = 0 end
  local address = string.format("%p", tbl)
  if refs[address] ~= nil then
    print(string.rep("  ", indent) .. "(circular reference to " .. address .. ")")
    return
  end

  if tbl.t and type(t) == "string" then
    print(string.rep("  ", indent) .. tbl.t)
  end
  local empty = true
  for k, v in pairs(tbl) do
    empty = false
    formatting = string.rep("  ", indent) .. k .. ": "
    v = asLua(v)
    if type(v) == "table" then
      print(formatting .. "table: " .. address)
      refs[address] = true
      tdump(v, indent+1, refs)
    elseif type(v) == 'boolean' then
      print(formatting .. tostring(v))
    elseif (v ~= nil) then 
      print(formatting .. tostring(v))
    else 
      print(formatting .. 'nil')
    end
  end
  if empty then
    print(string.rep("  ", indent) .. "<empty table>")
  end
end

function asLua(o)
  if type(o) ~= 'userdata' then
    return o
  end
  
  if rawequal(o, PANDOC_READER_OPTIONS) then
    return {
      abbreviations = o.abbreviations,
      columns = o.columns,
      default_image_extension = o.default_image_extension,
      extensions = o.extensions,
      indented_code_classes = o.indented_code_classes,
      standalone = o.standalone,
      strip_comments = o.strip_comments,
      tab_stop = o.tab_stop,
      track_changes = o.track_changes,
    }
  elseif rawequal(o, PANDOC_WRITER_OPTIONS) then
    return {
      cite_method = o.cite_method,
      columns = o.columns,
      dpi = o.dpi,
      email_obfuscation = o.email_obfuscation,
      epub_chapter_level = o.epub_chapter_level,
      epub_fonts = o.epub_fonts,
      epub_metadata = o.epub_metadata,
      epub_subdirectory = o.epub_subdirectory,
      extensions = o.extensions,
      highlight_style = o.highlight_style,
      html_math_method = o.html_math_method,
      html_q_tags = o.html_q_tags,
      identifier_prefix = o.identifier_prefix,
      incremental = o.incremental,
      listings = o.listings,
      number_offset = o.number_offset,
      number_sections = o.number_sections,
      prefer_ascii = o.prefer_ascii,
      reference_doc = o.reference_doc,
      reference_links = o.reference_links,
      reference_location = o.reference_location,
      section_divs = o.section_divs,
      setext_headers = o.setext_headers,
      slide_level = o.slide_level,
      tab_stop = o.tab_stop,
      table_of_contents = o.table_of_contents,
      template = o.template,
      toc_depth = o.toc_depth,
      top_level_division = o.top_level_division,
      variables = o.variables,
      wrap_text = o.wrap_text
    }
  end
  v = tostring(o)
  if string.find(v, "^pandoc CommonState") then
    return {
      input_files = o.input_files,
      output_file = o.output_file,
      log = o.log,
      request_headers = o.request_headers,
      resource_path = o.resource_path,
      source_url = o.source_url,
      user_data_dir = o.user_data_dir,
      trace = o.trace,
      verbosity = o.verbosity
    }
  elseif string.find(v, "^pandoc LogMessage") then
    return v
  end
  return o
end

-- dump an object to stdout
local function dump(o)
  o = asLua(o)
  if type(o) == 'table' then
    tdump(o)
  else
    print(tostring(o) .. "\n")
  end
end
-- debug.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- luacov: disable
function fail_and_ask_for_bug_report(message)
  fail(message .. "\nThis is a quarto bug. Please consider filing a bug report at https://github.com/quarto-dev/quarto-cli/issues", 5)
end

function fail(message, level)
  local file = currentFile()
  if file then
    fatal("An error occurred while processing '" .. file .. "':\n" .. message, level or 4)
  else
    fatal("An error occurred:\n" .. message, level or 4)
  end
end

function internal_error(msg, level)
  fail((msg and (msg .. '\n') or '') ..
    "This is an internal error. Please file a bug report at https://github.com/quarto-dev/quarto-cli/", level or 5)
end

function quarto_assert (test, msg, level)
  if not test then
    internal_error(msg, level or 6)
  end
end

function currentFile() 
  -- if we're in a multifile contatenated render, return which file we're rendering
  local fileState = currentFileMetadataState()
  if fileState ~= nil and fileState.file ~= nil and fileState.file.bookItemFile ~= nil then
    return fileState.file.bookItemFile
  elseif fileState ~= nil and fileState.include_directory ~= nil then
    return fileState.include_directory
  else
    -- if we're not in a concatenated scenario, file name doesn't really matter since the invocation is only
    -- targeting a single file
    return nil
  end
end
-- luacov: enable
-- figures.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- constants for figure attributes
kFigAlign = "fig-align"
kFigEnv = "fig-env"
kFigAlt = "fig-alt"
kFigPos = "fig-pos"
kFigCap = "fig-cap"
kFigScap = "fig-scap"
kResizeWidth = "resize.width"
kResizeHeight = "resize.height"

function isFigAttribute(name)
  return string.find(name, "^fig%-")
end

function figAlignAttributeDefault(el, default)
  local align = attribute(el, kFigAlign, default)
  if align == "default" then
    align = default
  end
  return validatedAlign(align, default)
end

function figAlignAttribute(el)
  local default = pandoc.utils.stringify(
    param(kFigAlign, pandoc.Str("default"))
  )
  local align = attribute(el, kFigAlign, default)
  if align == "default" then
    align = default
  end
  return validatedAlign(align, "center")
end

-- is this a Div containing a figure
function isFigureDiv(el, captionRequired)
  if is_regular_node(el, "Div") and hasFigureRef(el) then
    if captionRequired == nil then
      captionRequired = true
    end
    if not captionRequired then
      return true
    end
    return el.attributes[kFigCap] ~= nil or refCaptionFromDiv(el) ~= nil
  else
    return discoverLinkedFigureDiv(el) ~= nil
  end
end

local singleton_list = function(el) return #el.content == 1 end
function discoverFigure(el, captionRequired)
  if captionRequired == nil then
    captionRequired = true
  end
  local function check_caption(image)
    return #image.caption > 0 or not captionRequired
  end

  return quarto.utils.match(
    "Para", singleton_list, 1,
    "Image",
    check_caption)(el) or nil
end

function discoverLinkedFigure(el, captionRequired)
  local function check_caption(image)
    return #image.caption > 0 or not captionRequired
  end
  return quarto.utils.match(
    "Para", singleton_list, 1,
    "Link", singleton_list, 1,
    "Image", check_caption)(el) or nil
end

function discoverLinkedFigureDiv(el, captionRequired)
  if is_regular_node(el, "Div") and 
     hasFigureRef(el) and
     #el.content == 2 and 
     el.content[1].t == "Para" and 
     el.content[2].t == "Para" then
    return discoverLinkedFigure(el.content[1], captionRequired)  
  end
  return nil
end

local anonymousCount = 0
function anonymousFigId()
  anonymousCount = anonymousCount + 1
  return "fig-anonymous-" .. tostring(anonymousCount)
end

function isAnonymousFigId(identifier)
  return string.find(identifier, "^fig%-anonymous-")
end

function isReferenceableFig(figEl)
  return figEl.attr.identifier ~= "" and 
         not isAnonymousFigId(figEl.attr.identifier)
end

function latexIsTikzImage(image)
  return _quarto.format.isLatexOutput() and string.find(image.src, "%.tex$")
end

function latexFigureInline(image)
  -- if this is a tex file (e.g. created w/ tikz) then use \\input
  if latexIsTikzImage(image) then
    
    -- be sure to inject \usepackage{tikz}
    quarto_global_state.usingTikz = true
    
    -- base input
    local input = "\\input{" .. image.src .. "}"
    
    -- apply resize.width and/or resize.height if specified
    local rw = attribute(image, kResizeWidth, attribute(image, "width", "!"))
    local rh = attribute(image, kResizeHeight, attribute(image, "height", "!"))

    -- convert % to linewidth
    rw = asLatexSize(rw)
    rh = asLatexSize(rh)

    if rw ~= "!" or rh ~= "!" then
      input = "\\resizebox{" .. rw .. "}{" .. rh .. "}{" .. input .. "}"
    end
    
    -- return inline
    return pandoc.RawInline("latex", input)
  else
    return image
  end
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


-- floats.lua
-- Copyright (C) 2023 Posit Software, PBC

-- constants for float attributes
local kFloatAlignSuffix = "-align"
-- local kEnvSuffix = "-env"
-- local kAltSuffix = "-alt"
-- local kPosSuffix = "-pos"
-- local kCapSuffix = "-cap"
-- local kScapSuffix = "-scap"
-- local kResizeWidth = "resize.width"
-- local kResizeHeight = "resize.height"

function align_attribute(float)
  assert(float.t == "FloatRefTarget")
  local prefix = ref_type_from_float(float)
  local attr_key = prefix .. kFloatAlignSuffix
  local default = pandoc.utils.stringify(
    param(attr_key, pandoc.Str("default"))
  )
  local align = attribute(float, attr_key, default)
  if align == "default" then
    align = default
  end
  return validatedAlign(align, "center")
end
-- format.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

function round(num, numDecimalPlaces)
  local mult = 10^(numDecimalPlaces or 0)
  return math.floor(num * mult + 0.5) / mult
end
-- latex.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- generates a set of options for a tColorBox
function tColorOptions(options) 

  local optionStr = ""
  local prepend = false
  for k, v in spairs(options) do
    if (prepend) then 
      optionStr = optionStr .. ', '
    end
    if v ~= "" then
      optionStr = optionStr .. k .. '=' .. v
    else
      optionStr = optionStr .. k
    end
    prepend = true
  end
  return optionStr

end
-- layout.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

kLayoutAlign = "layout-align"
kLayoutVAlign = "layout-valign"
kLayoutNcol = "layout-ncol"
kLayoutNrow = "layout-nrow"
kLayout = "layout"

function layout_align_attribute(el_with_attr, default)
  return validatedAlign(el_with_attr.attributes[kLayoutAlign], default)
end

function layout_valign_attribute(el_with_attr, default)
  return validatedVAlign(el_with_attr.attributes[kLayoutVAlign] or default)
end

function attr_has_layout_attributes(attr)
  local attribs = tkeys(attr.attributes)
  return attribs:includes(kLayoutNrow) or
         attribs:includes(kLayoutNcol) or
         attribs:includes(kLayout)
end

function hasLayoutAttributes(el)
  return attr_has_layout_attributes(el.attr)
end

function isLayoutAttribute(key)
  return key == kLayoutNrow or
         key == kLayoutNcol or
         key == kLayout
end

-- locate an image in a layout cell
function figureImageFromLayoutCell(cellDivEl)
  for _,block in ipairs(cellDivEl.content) do
    local fig = discoverFigure(block, false)
    if not fig then
      fig = discoverLinkedFigure(block, false)
    end
    if not fig then
      fig = discoverLinkedFigureDiv(block, false)
    end
    if fig then
      return fig
    end
  end
  return nil
end


-- we often wrap a table in a div, unwrap it
function tableFromLayoutCell(cell)
  local tbl
  _quarto.traverser(cell, {
    Table = function(t)
      tbl = t
    end
  })
  return tbl
end

-- resolve alignment for layout cell (default to center or left depending
-- on the content in the cell)
function layoutCellAlignment(cell, align)
  if not align then
    local image = figureImageFromLayoutCell(cell) 
    local tbl = tableFromLayoutCell(cell)
    if image or tbl then
      return "center"
    else
      return "left"
    end
  else
    return align
  end
end

function sizeToPercent(size)
  if size then
    local percent = string.match(size, "^([%d%.]+)%%$")
    if percent then
      return tonumber(percent)
    end
  end
  return nil
end

function asLatexSize(size, macro)
  -- default to linewidth
  if not macro then
    macro = "linewidth"
  end
  -- see if this is a percent, if it is the conver 
  local percentSize = sizeToPercent(size)
  if percentSize then
    if percentSize == 100 then
      return "\\" .. macro
    else
      return string.format("%2.2f", percentSize/100) .. "\\" .. macro
    end
  else
    return size
  end
end
-- list.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

filter = pandoc.List.filter
-- log.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- TODO
-- could write to named filed (e.g. <docname>.filter.log) and client could read warnings and delete (also delete before run)
-- always append b/c multiple filters

--- The default, built-in error function.
-- The `error` global is redefined below.
local builtin_error_function = error

-- luacov: disable
local function caller_info(offset)
  offset = offset or 3
  local caller = debug.getinfo(offset, "lS")
  return caller.source:sub(2,-1) .. ":" .. tostring(caller.currentline)
end

function info(message)
  io.stderr:write(message .. "\n")
end

function warn(message, offset) 
  io.stderr:write(lunacolors.yellow("WARNING (" .. caller_info(offset) .. ") " .. message .. "\n"))
end

function error(message, offset)
  io.stderr:write(lunacolors.red(("ERROR (%s) %s\n"):format(caller_info(offset), message)))
end

function fatal(message, offset)
  io.stderr:write(lunacolors.red("FATAL (" .. caller_info(offset) .. ") " ..message .. "\n"))
  -- TODO write stack trace into log, and then exit.
  builtin_error_function('FATAL QUARTO ERROR', offset)
end
-- luacov: enable
-- lunacolors.lua
--
-- Copyright (c) 2021, Hilbis
-- https://github.com/Rosettea/Lunacolors

lunacolors = {}

function init(name, codes)
	lunacolors[name] = function(text)
		return ansi(codes[1], codes[2], text)
	end
end

function ansi(open, close, text)
	if text == nil then return '\27[' .. open .. 'm' end
	return '\27[' .. open .. 'm' .. text .. '\27[' .. close .. 'm'
end

-- Define colors
-- Modifiers
init('reset', {0, 0})
init('bold', {1, 22})
init('dim', {2, 22})
init('italic', {3, 23})
init('underline', {4, 24})
init('invert', {7, 27})
init('hidden', {8, 28})
init('strikethrough', {9, 29})

-- Colors
init('black', {30, 39})
init('red', {31, 39})
init('green', {32, 39})
init('yellow', {33, 39})
init('blue', {34, 39})
init('magenta', {35, 39})
init('cyan', {36, 39})
init('white', {37, 39})

-- Background colors
init('blackBg', {40, 49})
init('redBg', {41, 49})
init('greenBg', {42, 49})
init('yellowBg', {43, 49})
init('blueBg', {44, 49})
init('magentaBg', {45, 49})
init('cyanBg', {46, 49})
init('whiteBg', {47, 49})

-- Bright colors
init('brightBlack', {90, 39})
init('brightRed', {91, 39})
init('brightGreen', {92, 39})
init('brightYellow', {93, 39})
init('brightBlue', {94, 39})
init('brightMagenta', {95, 39})
init('brightCyan', {96, 39})
init('brightWhite', {97, 39})

-- Bright background 
init('brightBlackBg', {100, 49})
init('brightRedBg', {101, 49})
init('brightGreenBg', {102, 49})
init('brightYellowBg', {103, 49})
init('brightBlueBg', {104, 49})
init('brightMagentaBg', {105, 49})
init('brightCyanBg', {106, 49})
init('brightWhiteBg', {107, 49})

lunacolors.version = '0.1.0'
lunacolors.format = function(text)
	local colors = {
		reset = {'{reset}', ansi(0)},
		bold = {'{bold}', ansi(1)},
		dim = {'{dim}', ansi(2)},
		italic = {'{italic}', ansi(3)},
		underline = {'{underline}', ansi(4)},
		invert = {'{invert}', ansi(7)},
		bold_off = {'{bold-off}', ansi(22)},
		underline_off = {'{underline-off}', ansi(24)},
		black = {'{black}', ansi(30)},
		red = {'{red}', ansi(31)},
		green = {'{green}', ansi(32)},
		yellow = {'{yellow}', ansi(33)},
		blue = {'{blue}', ansi(34)},
		magenta = {'{magenta}', ansi(35)},
		cyan = {'{cyan}', ansi(36)},
		white = {'{white}', ansi(37)},
		red_bg = {'{red-bg}', ansi(41)},
		green_bg = {'{green-bg}', ansi(42)},
		yellow_bg = {'{green-bg}', ansi(43)},
		blue_bg = {'{blue-bg}', ansi(44)},
		magenta_bg = {'{magenta-bg}', ansi(45)},
		cyan_bg = {'{cyan-bg}', ansi(46)},
		white_bg = {'{white-bg}', ansi(47)},
		gray = {'{gray}', ansi(90)},
		bright_red = {'{bright-red}', ansi(91)},
		bright_green = {'{bright-green}', ansi(92)},
		bright_yellow = {'{bright-yellow}', ansi(93)},
		bright_blue = {'{bright-blue}', ansi(94)},
		bright_magenta = {'{bright-magenta}', ansi(95)},
		bright_cyan = {'{bright-cyan}', ansi(96)}
	}

	for k, v in pairs(colors) do
		text = text:gsub(v[1], v[2])
	end

	return text .. colors['reset'][2]
end
-- map-or-call.lua
-- Copyright (C) 2020 by RStudio, PBC

function map_or_call(fun, arrayOrValue)
  if tisarray(arrayOrValue) then
    -- array
    local result = {}
    for i, v in pairs(arrayOrValue) do
      table.insert(result, fun(v))
    end
    return result
  else
    -- value
    return fun(arrayOrValue)
  end
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
-- options.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- initialize options from 'crossref' metadata value
function readFilterOptions(meta, filter)
  local options = {}
  if type(meta[filter]) == "table" then
    options = readMetaOptions(meta[filter])
  end
  return options
end

-- get option value
function readOption(options, name, default)
  local value = options[name]
  if value == nil then
    value = default
  end

  if type(value) == "table" and value.clone ~= nil then
    return value:clone()
  else
    return value;
  end
end



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


-- ref parent attribute (e.g. fig:parent or tbl:parent)
kRefParent = "ref-parent"


-- does this element have a figure label?
function hasFigureRef(el)
  return isFigureRef(el.identifier)
end

function isFigureRef(identifier)
  if identifier == nil then
    return nil
  end
  
  local ref = refType(identifier)
  return crossref.categories.by_ref_type[ref] ~= nil
end

-- does this element have a table label?
function hasTableRef(el)
  return isTableRef(el.identifier)
end

function isTableRef(identifier)
  return (identifier ~= nil) and string.find(identifier, "^tbl%-")
end

-- does this element support sub-references
function hasFigureOrTableRef(el)
  return hasFigureRef(el) or hasTableRef(el)
end

function hasRefParent(el)
  return el.attributes[kRefParent] ~= nil
end

--[[
Return the ref type ("tbl", "fig", etc) for a given FloatRefTarget custom AST element.
]]
---@param float table # the FloatRefTarget element
---@return string # ref type for the given float
function ref_type_from_float(float)
  local category = crossref.categories.by_name[float.type]
  if category == nil then
    fail("unknown float type '" .. float.type .. "'");
    return ""
  end
  local result = refType(float.identifier)
  if result ~= nil and result ~= category.ref_type then
    warn("ref type '" .. result .. "' does not match category ref type '" .. category.ref_type .. "'");
  end
  return category.ref_type
end

function refType(id)
  local match = string.match(id, "^(%a+)%-")
  if match then
    return pandoc.text.lower(match)
  else
    return nil
  end
end

function refCaptionFromDiv(el)
  local last = el.content[#el.content]
  if last and last.t == "Para" and #el.content > 1 then
    return last
  else
    return nil
  end
end

function noCaption()
  return pandoc.Strong( { pandoc.Str("?(caption)") })
end

function emptyCaption()
  return pandoc.Str("")
end
-- string.lua
-- Copyright (C) 2020-2022 Posit Software, PBC


-- tests whether a string ends with another string
function endsWith(str, ending) 
  return ending == "" or str:sub(-#ending) == ending
end

function startsWith(str, starting) 
  return starting == "" or str:sub(1, #starting) == starting
end

-- trim a string
function trim(s)
  return (string.gsub(s, "^%s*(.-)%s*$", "%1"))
end

-- splits a string on a separator
function split(str, sep, allow_empty)
  local fields = {}
    sep = sep or " "
  local pattern
  if allow_empty == true then
    pattern = string.format("([^%s]*)", patternEscape(sep))
  else
    pattern = string.format("([^%s]+)", patternEscape(sep))
  end

  local _ignored = string.gsub(str, pattern, function(c) fields[#fields + 1] = c end)
  
  return fields
end

-- escape string by converting using Pandoc
function stringEscape(str, format)
  local doc = pandoc.Pandoc({pandoc.Para(str)})
  return pandoc.write(doc, format)
end

-- The character `%´ works as an escape for those magic characters. 
-- So, '%.' matches a dot; '%%' matches the character `%´ itself. 
-- You can use the escape `%´ not only for the magic characters, 
-- but also for all other non-alphanumeric characters. When in doubt, 
-- play safe and put an escape.
-- ( from http://www.lua.org/pil/20.2.html )
function patternEscape(str) 
  return str:gsub("([^%w])", "%%%1")
end

function html_escape(s, in_attribute)
  return s:gsub("[<>&\"']",
          function(x)
            if x == '<' then
              return '&lt;'
            elseif x == '>' then
              return '&gt;'
            elseif x == '&' then
              return '&amp;'
            elseif in_attribute and x == '"' then
              return '&quot;'
            elseif in_attribute and x == "'" then
              return '&#39;'
            else
              return x
            end
          end)
end

-- Escape '%' in string by replacing by '%%'
-- This is especially useful in Lua patterns to escape a '%'
function percentEscape(str)
  return str:gsub("%%", "%%%%")
end

-- table.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- append values to table
tappend = pandoc.List.extend

-- prepend values to table
function tprepend(t, values)
  local nvals = #values
  table.move(t, 1, #t, nvals + 1)     -- shift elements to make space
  table.move(values, 1, nvals, 1, t)  -- copy values into t
  return t
end

-- slice elements out of a table
function tslice(t, first, last, step)
  local sliced = {}
  for i = first or 1, last or #t, step or 1 do
    sliced[#sliced+1] = t[i]
  end
  return sliced
end

-- is the table a simple array?
-- see: https://web.archive.org/web/20140227143701/http://ericjmritz.name/2014/02/26/lua-is_array/
function tisarray(t)
  if type(t) ~= "table" then 
    return false 
  end
  local i = 0
  for _ in pairs(t) do
      i = i + 1
      if t[i] == nil then return false end
  end
  return true
end

-- map elements of a table
tmap = pandoc.List.map

-- does the table contain a value
function tcontains(t,value)
  if t and type(t)=="table" and value then
    return pandoc.List.includes(t, value)
  end
  return false
end

-- clear a table
function tclear(t)
  for k,_ in pairs(t) do
    t[k] = nil
  end
end

-- get keys from table
function tkeys(t)
  local keyset=pandoc.List({})
  for key in pairs(t) do
    keyset:insert(key)
  end
  return keyset
end

-- sorted pairs. order function takes (t, a,)
function spairs(t, order)
  -- collect the keys
  local keys = {}
  for k in pairs(t) do keys[#keys+1] = k end

  -- if order function given, sort by it by passing the table and keys a, b,
  -- otherwise just sort the keys
  if order then
      table.sort(keys, function(a,b) return order(t, a, b) end)
  else
      table.sort(keys)
  end

  -- return the iterator function
  local i = 0
  return function()
      i = i + 1
      if keys[i] then
          return keys[i], t[keys[i]]
      end
  end
end
-- tables.lua
-- Copyright (C) 2021-2022 Posit Software, PBC

local patterns = require("modules/patterns")

function anonymousTblId()
  return "tbl-anonymous-" .. tostring(math.random(10000000))
end

function isAnonymousTblId(identifier)
  return string.find(identifier, "^tbl%-anonymous-")
end

function isReferenceableTbl(tblEl)
  return tblEl.attr.identifier ~= "" and 
         not isAnonymousTblId(tblEl.attr.identifier)
end

function parseTableCaption(caption)
  -- string trailing space
  caption = stripTrailingSpace(caption)
  -- does the caption end with "}"
  local lastInline = caption[#caption]
  if lastInline ~= nil and lastInline.t == "Str" then
    if endsWith(trim(lastInline.text), "}") then
      -- find index of first inline that starts with "{"
      local beginIndex = nil
      for i = 1,#caption do 
        if caption[i].t == "Str" and startsWith(caption[i].text, "{") then
          beginIndex = i
          break
        end
      end
      if beginIndex ~= nil then 
        local attrText = trim(inlinesToString(pandoc.Inlines(tslice(caption, beginIndex, #caption))))
        attrText = attrText:gsub("“", "'"):gsub("”", "'")
        local elWithAttr = pandoc.read("## " .. attrText).blocks[1]
        if elWithAttr.attr ~= nil then
          if not startsWith(attrText, "{#") then
            elWithAttr.attr.identifier = ""
          end
          if beginIndex > 1 then
            return stripTrailingSpace(tslice(caption, 1, beginIndex - 1)), elWithAttr.attr
          else
            return pandoc.List({}), elWithAttr.attr
          end
        end
      end
    end   
  end

  -- no attributes
  return caption, pandoc.Attr("")

end

function createTableCaption(caption, attr)
  -- convert attr to inlines
  local attrInlines = pandoc.List()
  if attr.identifier ~= nil and attr.identifier ~= "" then
    attrInlines:insert(pandoc.Str("#" .. attr.identifier))
  end
  if #attr.classes > 0 then
    for i = 1,#attr.classes do
      if #attrInlines > 0 then
        attrInlines:insert(pandoc.Space())
      end
      attrInlines:insert(pandoc.Str("." .. attr.classes[i]))
    end
  end
  if #attr.attributes > 0 then
    for k,v in pairs(attr.attributes) do
      if #attrInlines > 0 then
        attrInlines:insert(pandoc.Space())
      end
      attrInlines:insert(pandoc.Str(k .. "='" .. v .. "'"))
    end
  end
  if #attrInlines > 0 then
    attrInlines:insert(1, pandoc.Space())
    attrInlines[2] = pandoc.Str("{" .. attrInlines[2].text)
    attrInlines[#attrInlines] = pandoc.Str(attrInlines[#attrInlines].text .. "}")
    local tableCaption = caption:clone()
    tappend(tableCaption, attrInlines)
    return tableCaption
  else
    return caption
  end
end


function countTables(div)
  local tables = 0
  _quarto.ast.walk(div, {
    Table = function(table)
      tables = tables + 1
    end,
    RawBlock = function(raw)
      if hasTable(raw) then
        tables = tables + 1
      end
    end
  })
  return tables
end

function hasGtHtmlTable(raw)
  if _quarto.format.isRawHtml(raw) and _quarto.format.isHtmlOutput() then
    return raw.text:match(patterns.html_gt_table)
  else
    return false
  end
end

function hasPagedHtmlTable(raw)
  if _quarto.format.isRawHtml(raw) and _quarto.format.isHtmlOutput() then
    return raw.text:match(patterns.html_paged_table)
  else
    return false
  end
end

function hasRawHtmlTable(raw)
  if _quarto.format.isRawHtml(raw) and _quarto.format.isHtmlOutput() then
    return raw.text:match(patterns.html_table)
  else
    return false
  end
end

function hasRawLatexTable(raw)
  if _quarto.format.isRawLatex(raw) and _quarto.format.isLatexOutput() then
    local matched, _ = _quarto.modules.patterns.match_in_list_of_patterns(raw.text, _quarto.patterns.latexAllTableEnvPatterns)
    if matched then
      return true
    end
  end
  return false
end

local tableCheckers = {
  hasRawHtmlTable,
  hasRawLatexTable,
  hasPagedHtmlTable,
}

function hasTable(raw)
  for i, checker in ipairs(tableCheckers) do
    local val = checker(raw)
    if val then
      return true
    end
  end
  return false
end
-- theorems.lua
-- Copyright (C) 2020-2022 Posit Software, PBC
-- url.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

function urldecode(url)
  if url == nil then
  return
  end
    url = url:gsub("+", " ")
    url = url:gsub("%%(%x%x)", function(x)
      return string.char(tonumber(x, 16))
    end)
  return url
end

function fullyUrlDecode(url)
  -- decode the url until it is fully decoded (not a single pass,
  -- but repeated until it decodes no further)
  result = urldecode(url)
  if result == url then
    return result
  else 
    return fullyUrlDecode(result)
  end
end
-- validate.lua
-- Copyright (C) 2020-2022 Posit Software, PBC


function validatedAlign(align, default)
  local kAlignments = pandoc.List({ "center", "left", "right" })
  return validateInList(align, kAlignments, "alignment", default)
end

function validatedVAlign(vAlign)
  local kVAlignments = pandoc.List({"top", "top-baseline", "center", "bottom"})
  return validateInList(vAlign, kVAlignments, "vertical alignment", "top")
end

function validateInList(value, list, attribute, default)
  if value == "default" then
    return default
  elseif value and not list:includes(value) then
    -- luacov: disable
    warn("Invalid " .. attribute .. " attribute value: " .. value)
    return default
    -- luacov: enable
  else
    return value
  end
end


-- wrapped-filter.lua
-- creates wrapped pandoc filters
-- Copyright (C) 2022 by RStudio, PBC

local function shortcodeMetatable(scriptFile) 
  return {
    -- https://www.lua.org/manual/5.3/manual.html#6.1
    assert = assert,
    collectgarbage = collectgarbage,
    dofile = dofile,
    error = error,
    getmetatable = getmetatable,
    ipairs = ipairs,
    load = load,
    loadfile = loadfile,
    next = next,
    pairs = pairs,
    pcall = pcall,
    print = print,
    rawequal = rawequal,
    rawget = rawget,
    rawlen = rawlen,
    rawset = rawset,
    select = select,
    setmetatable = setmetatable,
    tonumber = tonumber,
    tostring = tostring,
    type = type,
    _VERSION = _VERSION,
    xpcall = xpcall,
    coroutine = coroutine,
    require = require,
    package = package,
    string = string,
    utf8 = utf8,
    table = table,
    math = math,
    io = io,
    file = file,
    os = os,
    debug = debug,
    -- https://pandoc.org/lua-filters.html
    FORMAT = FORMAT,
    PANDOC_READER_OPTIONS = PANDOC_READER_OPTIONS,
    PANDOC_WRITER_OPTIONS = PANDOC_WRITER_OPTIONS,
    PANDOC_VERSION = PANDOC_VERSION,
    PANDOC_API_VERSION = PANDOC_API_VERSION,
    PANDOC_SCRIPT_FILE = scriptFile,
    PANDOC_STATE = PANDOC_STATE,
    pandoc = pandoc,
    lpeg = lpeg,
    re = re,
    -- quarto global environment
    json = json,
    -- quarto functions
    quarto = quarto,
    -- global environment
    _G = _G
  }
end

local function safeguard_for_meta(customnode)
  if customnode == nil then
    return nil
  end
  local result = {}
  for k,v in pairs(customnode) do
    local t = type(v)
    local pt = pandoc.utils.type(v)
    if pt == "Attr" then
      local converted_attrs = {}
      for i, attr in ipairs(v.attributes) do
        table.insert(converted_attrs, {
          attr[1], attr[2]
        })
      end
      result[k] = {
        identifier = v.identifier,
        classes = v.classes,
        attributes = converted_attrs
      }
    elseif t == "userdata" then
      result[k] = v -- assume other pandoc objects are ok
    elseif t == "table" then
      result[k] = safeguard_for_meta(v)
    end
  end
  return result
end

function makeWrappedJsonFilter(scriptFile, filterHandler)
  local handlers = {
    Pandoc = {
      file = scriptFile,
      handle = function(doc)
        local json = pandoc.write(doc, "json")
        path = quarto.utils.resolve_path_relative_to_document(scriptFile)
        local custom_node_map = {}
        local has_custom_nodes = false
        doc = _quarto.traverser(doc, {
          -- FIXME: This is broken with new AST. Needs to go through Custom node instead.
          RawInline = function(raw)
            local custom_node, t, kind = _quarto.ast.resolve_custom_data(raw)
            if custom_node ~= nil then
              has_custom_nodes = true
              custom_node = safeguard_for_meta(custom_node)
              table.insert(custom_node_map, { id = raw.text, tbl = custom_node, t = t, kind = kind })
            end
          end,
          Meta = function(meta)
            if has_custom_nodes then
              meta["quarto-custom-nodes"] = pandoc.MetaList(custom_node_map)
            end
            return meta
          end
        })
        local success, result = pcall(pandoc.utils.run_json_filter, doc, path)
        if not success then
          local pandoc_error = tostring(result)
          local filename = pandoc.path.filename(path)
          local message = {
            "Could not run " .. path .. " as a JSON filter.",
            "Please make sure the file exists and is executable.",
            "\nDid you intend '" .. filename .. "' as a Lua filter in an extension?",
            "If so, make sure you've spelled the name of the extension correctly.",
            "\nThe original Pandoc error follows below.",
            pandoc_error
          }
          fail(table.concat(message, "\n"))
          return nil
        end
        if has_custom_nodes then
          _quarto.traverser(doc, {
            Meta = function(meta)
              _quarto.ast.reset_custom_tbl(meta["quarto-custom-nodes"])
            end
          })
        end

        return result
      end
    }
  }

  if filterHandler ~= nil then
    return filterHandler(handlers)
  else
    local result = {}
    for k,v in pairs(handlers) do
      result[k] = v.handle
    end
    return result
  end    
end

function makeWrappedLuaFilter(scriptFile, filterHandler)
  return _quarto.withScriptFile(scriptFile, function()
    local env = setmetatable({}, {__index = shortcodeMetatable(scriptFile)})
    local chunk, err = loadfile(scriptFile, "bt", env)
    local handlers = {}
  
    local function makeSingleHandler(handlerTable)
      local result = {}
      setmetatable(result, {
        __index = { scriptFile = scriptFile }
      })
      for k,v in pairs(handlerTable) do
        result[k] = {
          file = scriptFile,
          handle = v,
        }
      end
      return result
    end
  
    if not err and chunk then
      local result = chunk()
      if result then
        if quarto.utils.table.isarray(result) then
          for i, handlerTable in ipairs(result) do
            table.insert(handlers, makeSingleHandler(handlerTable))
          end
        else
          handlers = makeSingleHandler(result)
        end
      else
        handlers = makeSingleHandler(env)
      end
  
      if filterHandler ~= nil then
        return filterHandler(handlers)
      else
        result = {}
        for k,v in pairs(handlers) do
          result[k] = v.handle
        end
        return result
      end    
    else
      error(err)
      os.exit(1)
    end
  end)
end

function makeWrappedFilter(scriptFile, filterHandler)
  if type(scriptFile) == "userdata" then
    scriptFile = pandoc.utils.stringify(scriptFile)
  end

  if type(scriptFile) == "string" then
    return makeWrappedLuaFilter(scriptFile, filterHandler)
  elseif type(scriptFile) == "table" then
    local path = scriptFile.path
    local type = scriptFile.type

    if type == "json" then
      return makeWrappedJsonFilter(path, filterHandler)  
    else
      return makeWrappedLuaFilter(path, filterHandler)
    end
  end
end

function filterIf(condition, filter)
  return {
    Pandoc = function(doc)
      if condition() then
        return _quarto.ast.walk(doc, filter) -- doc:walk(filter)
      end
    end
  }
end

function filterSeq(filters)
  return {
    Pandoc = function(doc)
      local result
      -- TODO handle timing and tracing uniformly through our new filter infra
      for _, filter in ipairs(filters) do
        if filter.filter ~= nil then
          filter = filter.filter
        end
        local r = run_emulated_filter(doc, filter, true)
        if r ~= nil then
          doc = r
          result = r
        end
      end
      return result
    end
  }
end
-- configurefilters.lua
-- Determine which filter chains will be active

function configure_filters()
  -- return {
  --   Meta = function(meta)
  quarto_global_state.active_filters = param("active-filters")
  --   end
  -- }
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
-- flags.lua
-- Copyright (C) 2020-2023 Posit Software, PBC

-- computes performance flags in one pass
-- so that we can skip as many filters as possible
-- when we don't need them

local patterns = require("modules/patterns")
local constants = require("modules/constants")
local lightbox_module = require("modules/lightbox")

flags = {}

function compute_flags()
  local table_pattern = patterns.html_table
  local table_tag_pattern = patterns.html_table_tag_name
  local gt_table_pattern = patterns.html_gt_table
  local function find_shortcode_in_attributes(el)
    for k, v in pairs(el.attributes) do
      if type(v) == "string" and v:find("%{%{%<") then
        return true
      end
    end
    return false
  end

  return {{
    Header = function(el)
      if find_shortcode_in_attributes(el) then
        flags.has_shortcodes = true
      end
      crossref.maxHeading = math.min(crossref.maxHeading, el.level)
    end,

    Table = function(node)
      flags.has_tables = true
    end,

    Cite = function(cite)
      flags.has_cites = true
    end,

    RawBlock = function(el)
      if el.format == "html" then
        local i, j = string.find(el.text, table_pattern)
        if i ~= nil then
          flags.has_raw_html_tables = true
        end
        i, j = string.find(el.text, table_tag_pattern)
        if i ~= nil then
          flags.has_partial_raw_html_tables = true
        end
        i, j = string.find(el.text, gt_table_pattern)
        if i ~= nil then
          flags.has_gt_tables = true
        end
      end

      if _quarto.format.isRawLatex(el) then
        local long_table_match, _ = _quarto.modules.patterns.match_in_list_of_patterns(el.text, _quarto.patterns.latexLongtableEnvPatterns)
        if long_table_match then
            local caption_match, _= _quarto.modules.patterns.match_in_list_of_patterns(el.text, _quarto.patterns.latexCaptionPatterns)
            if not caption_match then
              flags.has_longtable_no_caption_fixup = true
            end
        end
      end

      if el.text:find("%{%{%<") then
        flags.has_shortcodes = true
      end
    end,
    Div = function(node)
      if find_shortcode_in_attributes(node) then
        flags.has_shortcodes = true
      end
      local type = refType(node.attr.identifier)
      if theorem_types[type] ~= nil or proof_type(node) ~= nil then
        flags.has_theorem_refs = true
      end

      local has_lightbox = lightbox_module.el_has_lightbox(node)
      if has_lightbox then
        flags.has_lightbox = true
      end

      if node.attr.classes:find("landscape") then
        flags.has_landscape = true
      end

      if node.attr.classes:find("hidden") then
        flags.has_hidden = true
      end

      if node.attr.classes:find("list-table") then
        flags.has_list_tables = true
      end

      if node.attr.classes:find("cell") then
        -- cellcleanup.lua
        flags.has_output_cells = true

        -- FIXME: are we actually triggering this with FloatRefTargets?
        -- table captions
        local kTblCap = "tbl-cap"
        if hasTableRef(node) or node.attr.attributes[kTblCap] then
          flags.has_table_captions = true
        end

        -- outputs.lua
        if not param("output-divs", true) then
          if not (_quarto.format.isPowerPointOutput() and hasLayoutAttributes(node)) then
            flags.needs_output_unrolling = true
          end
        end

        -- cell-renderings.lua
        if node.attributes["renderings"] then
          flags.has_renderings = true
        end
      end
    end,
    CodeBlock = function(node)
      if node.attr.classes:find("hidden") then
        flags.has_hidden = true
      end
      if node.attr.classes:find("content-hidden") or node.attr.classes:find("content-visible") then
        flags.has_conditional_content = true
      end
      if node.text:match('%s*<([0-9]+)>%s*') then
        flags.has_code_annotations = true
      end
      if node.text:find("%{%{%<") then
        flags.has_shortcodes = true
      end
    end,
    Code = function(node)
      if node.text:find("%{%{%<") then
        flags.has_shortcodes = true
      end
    end,
    RawInline = function(el)
      if el.format == "quarto-internal" then
        local result, data = pcall(function() 
          local data = quarto.json.decode(el.text)
          return data.type
        end)
        if result == false then
          warn("[Malformed document] Failed to decode quarto-internal JSON: " .. el.text)
          return
        end
        if data == "contents-shortcode" then
          flags.has_contents_shortcode = true
        end
      elseif el.text:find("%{%{%<") then
        flags.has_shortcodes = true
      end
    end,
    Image = function(node)
      if find_shortcode_in_attributes(node) or node.src:find("%{%{%<") then
        flags.has_shortcodes = true
      end

      local has_lightbox = lightbox_module.el_has_lightbox(node)
      if has_lightbox then
        flags.has_lightbox = true
      end
    end,
    Shortcode = function(node)
      flags.has_shortcodes = true
    end,
    Link = function(node)
      if find_shortcode_in_attributes(node) then
        flags.has_shortcodes = true
      end
      if node.target:find("%{%{%<") then
        flags.has_shortcodes = true
      end
    end,
    Span = function(node)
      if find_shortcode_in_attributes(node) then
        flags.has_shortcodes = true
      end
      if node.attr.classes:find("content-hidden") or node.attr.classes:find("content-visible") then
        flags.has_conditional_content = true
      end
    end,
    Figure = function(node)
      flags.has_pandoc3_figure = true
    end,
    Note = function(node)
      flags.has_notes = true
    end,
  }, {
    Meta = function(el)
      local lightbox_auto = lightbox_module.automatic(el)
      if lightbox_auto then
        flags.has_lightbox = true
      elseif lightbox_auto == false then
        flags.has_lightbox = false
      end
    end,
  }}
end
-- normalize.lua
-- Copyright (C) 2020-2023 Posit Software, PBC

-- required version
PANDOC_VERSION:must_be_at_least '2.13'

-- global state
authorsState = {}

-- [import]
function import(script)
  local path = PANDOC_SCRIPT_FILE:match("(.*[/\\])")
  dofile(path .. script)
end

-- [/import]

-- imported elements
local authors = require 'modules/authors'
local license = require 'modules/license'
local shortcode_ast = require 'modules/astshortcode'

-- Convert block-level metadata to inline for fields rendered inside <p> tags.
-- Multi-line YAML values produce MetaBlocks (Para), which nest <p> in <p> — invalid HTML5.
local function ensureMetaInlines(meta, field)
  local val = meta[field]
  if val ~= nil and quarto.utils.type(val) == "Blocks" then
    meta[field] = quarto.utils.as_inlines(val)
  end
end

function normalize_filter()
  return {
    Meta = function(meta)
      -- normalizes the author/affiliation metadata
      local normalized = authors.processAuthorMeta(meta) or meta

      -- normalizes the citation metadata
      normalized = processCitationMeta(normalized)

      -- normalizes the license metadata
      normalized = license.processLicenseMeta(normalized)

      -- Convert block-level metadata to inline for fields rendered in <p> tags
      ensureMetaInlines(normalized, "subtitle")

      -- for JATs, forward keywords or categories to tags
      if _quarto.format.isJatsOutput() then
        if normalized.tags == nil then
          if normalized.keywords ~= nil then
            normalized.tags = normalized.keywords
          elseif meta.categories ~= nil then
            normalized.tags = normalized.categories
          end
        end
      end

      -- parses the shortcodes that might be in the metadata
      -- since they're not visible in the text that is available
      -- to qmd-reader.lua

      normalized = shortcode_ast.parse(normalized)

      return normalized
    end
  }
end

-- extractquartodom.lua
-- Copyright (C) 2023 Posit Software, PBC

function parse_md_in_html_rawblocks()
  local function process_quarto_markdown_input_element(el)
    if el.attributes.qmd == nil and el.attributes["qmd-base64"] == nil then
      error("process_quarto_markdown_input_element called with element that does not have qmd or qmd-base64 attribute")
      return el
    end
    local text = el.attributes.qmd or quarto.base64.decode(el.attributes["qmd-base64"])
    return string_to_quarto_ast_blocks(text)
  end

  return {
    Div = function(div)
      if div.attributes.qmd ~= nil or div.attributes["qmd-base64"] ~= nil then
        return _quarto.ast.scaffold_element(process_quarto_markdown_input_element(div))
      end
    end,
    Span = function(span)
      if span.attributes.qmd ~= nil or span.attributes["qmd-base64"] ~= nil then
        local inlines = quarto.utils.as_inlines(process_quarto_markdown_input_element(span))
        if #inlines < 1 then
          return _quarto.ast.scaffold_element(pandoc.Inlines({}))
        end
        return _quarto.ast.scaffold_element(inlines)
      end
    end,
    RawBlock = function(raw)
      local result
      if raw.format:sub(1, 14) == "pandoc-reader-" then
        -- this is a pandoc reader format, so we can read it directly
        result = pandoc.read(raw.text, raw.format:sub(15)).blocks
      elseif raw.format == "pandoc-native" then
        result = pandoc.read(raw.text, "native").blocks
      elseif raw.format == "pandoc-json" then
        result = pandoc.read(raw.text, "json").blocks
      else
        return raw
      end
      return result
    end,
    RawInline = function(raw)
      local result
      if raw.format:sub(1, 14) == "pandoc-reader-" then
        -- this is a pandoc reader format, so we can read it directly
        result = quarto.utils.as_inlines(pandoc.read(raw.text, raw.format:sub(15)).blocks)
      elseif raw.format == "pandoc-native" then
        result = quarto.utils.as_inlines(pandoc.read(raw.text, "native").blocks)
      elseif raw.format == "pandoc-json" then
        -- let's try to be minimally smart here, and handle lists differently from a single top-level element
        result = quarto.utils.as_inlines(pandoc.read(raw.text, "json").blocks)
      else
        return raw
      end
      return result
    end,
  }
end

extracted_qmd_uuid = "3ab579b5-63b4-445d-bc1d-85bf6c4c04de"
local count = 0

function extract_latex_quartomarkdown_commands()
  if not _quarto.format.isLatexOutput() then 
    return {}
  end

  if doc == nil then
    return {
      RawBlock = function(el)
        if not _quarto.format.isRawLatex(el) then
          return nil
        end
        local text = el.text
        -- provide an early exit if the text does not contain the pattern
        -- because Lua's pattern matching apparently takes a long time
        -- to fail: https://github.com/quarto-dev/quarto-cli/issues/9729
        if text:match("\\QuartoMarkdownBase64{") == nil then
          return nil
        end
        local pattern = "(.*)(\\QuartoMarkdownBase64{)([^}]*)(})(.*)"
        local pre, _, content, _, post = text:match(pattern)
        if pre == nil then
          return nil
        end
        while pre do
          count = count + 1
          local uuid = extracted_qmd_uuid .. "-" .. tostring(count)
          _quarto.ast.vault.add(uuid, string_to_quarto_ast_blocks(quarto.base64.decode(content)))
          text = pre .. uuid .. post
          pre, _, content, _, post = text:match(pattern)
        end
        return pandoc.RawBlock(el.format, text)
      end
    }
  end
end

function inject_vault_content_into_rawlatex()
  return {
    RawBlock = function(el)
      if not _quarto.format.isRawLatex(el) then
        return nil
      end
      local vault = _quarto.ast.vault.locate()
      if vault == nil then
        -- luacov: disable
        internal_error()
        return nil
        -- luacov: enable
      end
      local text = el.text
      -- provide an early exit if the text does not contain the pattern
      -- because Lua's pattern matching apparently takes a long time
      -- to fail: https://github.com/quarto-dev/quarto-cli/issues/9729
      if el.text:match("3ab579b5%-63b4%-445d%-bc1d%-85bf6c4c04de") == nil then
        return nil
      end
  
      local pattern = "(.*)(3ab579b5%-63b4%-445d%-bc1d%-85bf6c4c04de%-[0-9]+)(.*)"
      local pre, content_id, post = text:match(pattern)

      while pre do
        local found = false
        vault.content = _quarto.ast.walk(vault.content, {
          Div = function(div)
            if div.identifier ~= content_id then
              return
            end
            _quarto.ast.vault.remove(content_id)
            local rendered = pandoc.write(pandoc.Pandoc(div.content), "latex")
            text = pre .. rendered .. post
            pre, content_id, post = text:match(pattern)
            found = true
            return {}
          end
        })
        if not found then
          -- luacov: disable
          internal_error()
          return nil
          -- luacov: enable
        end
      end
      return pandoc.RawBlock(el.format, text)
    end,
  }
end
-- astpipeline.lua
-- Copyright (C) 2023 Posit Software, PBC

function quarto_ast_pipeline()
  local patterns = require("modules/patterns")
  local constants = require("modules/constants")

  local function astpipeline_process_tables()
    local function replace_spaces_not_in_tags(text)
      local parts = {}
      local intag = false
      local lastchange = 1
      for i = 1, #text do
        local char = text:sub(i, i)
        if not intag then
          if char == '<' then
            intag = true
          elseif char == ' ' then
            table.insert(parts, text:sub(lastchange, i-1))
            table.insert(parts, '&nbsp;')
            lastchange = i+1
          end
        else
          if char == '>' then
            intag = false
          end
        end
      end
      table.insert(parts, text:sub(lastchange))
      return table.concat(parts, '')
    end

    local function preprocess_table_text(src)
      -- html manipulation with regex is fraught, but these specific
      -- changes are safe assuming that no one is using quarto- as
      -- a prefix for dataset attributes in the tables.
      -- See
      -- * https://www.w3.org/html/wg/spec/syntax.html#start-tags
      -- * https://www.w3.org/html/wg/spec/syntax.html#end-tags
    
      src = src:gsub("<th([%s>])", "<td data-quarto-table-cell-role=\"th\"%1")
      src = src:gsub("</th([%s>])", "</td%1")
      src = src:gsub("<table([%s>])", "<table data-quarto-postprocess=\"true\"%1")
    
      return src
    end
    local function juice(htmltext)
      -- return htmltext
      return pandoc.system.with_temporary_directory('juice', function(tmpdir)
        -- replace any long data uris with uuids
        local data_uri_uuid = '273dae7e-3633-4385-9b0c-203d2d7a2d37'
        local data_uris = {}
        local data_uri_regex = 'data:image/[a-z]+;base64,[a-zA-Z0-9+/]+=*'
        htmltext = htmltext:gsub(data_uri_regex, function(data_uri)
          -- juice truncates around 15k characters; let's guard any over 2000 characters
          if #data_uri > 2000 then
            table.insert(data_uris, data_uri)
            return data_uri_uuid
          else
            return data_uri
          end
        end)
        local juice_in = pandoc.path.join({tmpdir, 'juice-in.html'})
        local jin = assert(io.open(juice_in, 'w'))
        jin:write(htmltext)
        jin:flush()
        local quarto_path = quarto.config.cli_path()
        local juice_script = pandoc.path.join({os.getenv('QUARTO_SHARE_PATH'), 'scripts', 'juice.ts'})
        local ok, content = pcall(pandoc.pipe, quarto_path, {'run', juice_script, juice_in}, '')
        if not ok then
          quarto.log.error('Running juice failed: ' .. tostring(content))
          return htmltext
        end
        local index = 1
        content = content:gsub(data_uri_uuid:gsub('-', '%%-'), function(_)
          local data_uri = data_uris[index]
          index = index + 1
          return data_uri
        end)
        return content
      end)
    end   
    local function should_handle_raw_html_as_table(el)
      if not _quarto.format.isRawHtml(el) then
        return nil
      end
      -- See https://github.com/quarto-dev/quarto-cli/issues/8670
      -- and https://quarto.org/docs/authoring/tables.html#library-authors
      -- for the motivation for this change.
      if string.find(el.text, patterns.html_disable_table_processing_comment) then
        return nil
      end
      -- if we have a raw html table in a format that doesn't handle raw_html
      -- then have pandoc parse the table into a proper AST table block
      -- we're already at a state of sin here, cf https://stackoverflow.com/a/1732454
      -- but this is important enough to do a little more work anyway
      local pat = patterns.html_table
      local i, j = string.find(el.text, pat)
      if i == nil then
        return nil
      end
      return true
    end
    local function handle_raw_html_as_table(el)
      local eltext
      -- trim leading and trailing spaces
      el.text = el.text:gsub("^%s*(.-)%s*$", "%1")

      if(_quarto.format.isTypstOutput()) then
        eltext = juice(el.text)
      else
        eltext = el.text
      end
  
      local blocks = pandoc.Blocks({})
      local start = patterns.html_start_tag("table")
      local finish = patterns.html_end_tag("table")
  
  
      local cursor = 1
      local len = string.len(eltext)
  
      while cursor < len do
        -- find the first table start tag
        local i, j = string.find(eltext, start, cursor)
        if i == nil then
          -- no more tables
          break
        end
  
        -- find the closest table end tag 
        -- that produces a valid table parsing from Pandoc
        local cursor_2 = j + 1
        local nesting = 1
        while cursor_2 < len do
          local k1, l1 = string.find(eltext, start, cursor_2)
          local k2, l2 = string.find(eltext, finish, cursor_2)
          if k1 == nil and k2 == nil then
            cursor = len
            break
          end
          if k1 and (k2 == nil or k1 < k2) then
            nesting = nesting + 1
            cursor_2 = l1 + 1
          else
            -- not k1 or k1 >= k2
            nesting = nesting - 1
            cursor_2 = l2 + 1
            if nesting == 0 then
              local tableHtml = string.sub(eltext, i, l2)
              -- Pandoc's HTML-table -> AST-table processing does not faithfully respect
              -- `th` vs `td` elements. This causes some complex tables to be parsed incorrectly,
              -- and changes which elements are `th` and which are `td`.
              --
              -- For quarto, this change is not acceptable because `td` and `th` have
              -- accessibility impacts (see https://github.com/rstudio/gt/issues/678 for a concrete
              -- request from a screen-reader user).
              --
              -- To preserve td and th, we replace `th` elements in the input with 
              -- `td data-quarto-table-cell-role="th"`. 
              -- 
              -- Then, in our HTML postprocessor,
              -- we replace th elements with td (since pandoc chooses to set some of its table
              -- elements as th, even if the original table requested not to), and replace those 
              -- annotated td elements with th elements.
              tableHtml = preprocess_table_text(tableHtml)
              local tableDoc = pandoc.read(tableHtml, "html+raw_html")
              local found = false
              local skip = false
              _quarto.traverser(tableDoc, {
                Table = function(table)
                  found = true
                  if table.attributes[constants.kDisableProcessing] == "true" then
                    skip = true
                  end
                end,
              })
              if #tableDoc.blocks ~= 1 then
                warn("Unable to parse table from raw html block: skipping.")
                skip = true
              end
              if found and not skip then
                flags.has_tables = true
                if cursor ~= i then
                  blocks:insert(pandoc.RawBlock(el.format, string.sub(eltext, cursor, i - 1)))
                end
                blocks:insert(tableDoc.blocks[1])
              end
              cursor = l2 + 1
              break
            end
          end
        end
      end
      if #blocks == 0 then
        return nil
      end
      if cursor > 1 and cursor <= len then
        blocks:insert(pandoc.RawBlock(el.format, string.sub(eltext, cursor)))
      end
      return _quarto.ast.scaffold_element(blocks)
    end
    local function should_handle_raw_html_as_pre_tag(pre_tag)
      if not _quarto.format.isRawHtml(pre_tag) then
        return nil
      end
      local pat = patterns.html_pre_tag
      local i, j = string.find(pre_tag.text, pat)
      if i == nil then
        return nil
      end
      return true
    end
    local function handle_raw_html_as_pre_tag(pre_tag)
      local eltext
      if(_quarto.format.isTypstOutput()) then
        eltext = juice(pre_tag.text)
      else
        eltext = pre_tag.text
      end
  
      local preContentHtml = eltext:match('<pre[^>]*>(.*)</pre>')
      if not preContentHtml then
        quarto.log.error('no pre', eltext:sub(1,1700))
        return nil
      end
      preContentHtml = replace_spaces_not_in_tags(preContentHtml)
      preContentHtml = preContentHtml:gsub('\n','<br />')
      local preDoc = pandoc.read(preContentHtml, "html+raw_html")
      local block1 = preDoc.blocks[1]
      local blocks = pandoc.Blocks({
        pandoc.Div(block1, pandoc.Attr("", {}, {style = 'font-family: Inconsolata, Roboto Mono, Courier New;'}))
      })
      return _quarto.ast.scaffold_element(blocks)
    end
    
    local disable_html_table_processing = false
    local disable_html_pre_tag_processing = false
    if param(constants.kHtmlTableProcessing) == "none" then
      disable_html_table_processing = true
    end
    if param(constants.kHtmlPreTagProcessing) == "none" then
      disable_html_pre_tag_processing = true
    end
    
    local filter = {
      traverse = 'topdown',
      Div = function(div)
        if div.attributes[constants.kHtmlTableProcessing] and not disable_html_table_processing then
          -- catch and remove attributes
          local htmlTableProcessing = div.attributes[constants.kHtmlTableProcessing]
          div.attributes[constants.kHtmlTableProcessing] = nil
          if htmlTableProcessing == "none" then
            if div.attr == pandoc.Attr() then
              -- if no other attributes are set on the div, don't keep it
              return div.content, false
            else
              -- when set on a div like div.cell-output-display, we need to keep it
              return div, false
            end
          end
        end
        if div.attributes[constants.kHtmlPreTagProcessing] and not disable_html_pre_tag_processing then
          local htmlPreTagProcessing = div.attributes[constants.kHtmlPreTagProcessing]
          if htmlPreTagProcessing == "parse" then
            local pre_tag = quarto.utils.match('Div/[1]/RawBlock')(div)
            if pre_tag and should_handle_raw_html_as_pre_tag(pre_tag) then
              return handle_raw_html_as_pre_tag(pre_tag), false
            end
          end
        end
      end,
      RawBlock = function(el)
        if not should_handle_raw_html_as_table(el) or disable_html_table_processing then
          return nil
        end
        return handle_raw_html_as_table(el)
      end  
    };

    -- table_merge_raw_html from table-rawhtml.lua
    if _quarto.format.isHtmlOutput() then
      filter.Blocks = function(blocks)
        local pending_raw = pandoc.List()
        local next_element_idx = 1
        for _, el in ipairs(blocks) do
          if _quarto.format.isRawHtml(el) and
             el.text:find(patterns.html_table_tag_name) then
            pending_raw:insert(el.text)
          else
            if next(pending_raw) then
              blocks[next_element_idx] =
                pandoc.RawBlock("html", table.concat(pending_raw, "\n"))
              pending_raw = pandoc.List()
              next_element_idx = next_element_idx + 1
            end
            blocks[next_element_idx] = el
            next_element_idx = next_element_idx + 1
          end
        end
        if #pending_raw > 0 then
          blocks[next_element_idx] =
            pandoc.RawBlock("html", table.concat(pending_raw, "\n"))
          next_element_idx = next_element_idx + 1
        end
        for i = next_element_idx, #blocks do
          blocks[i] = nil
        end
        return blocks
      end      
    end

    return filter
  end

  return {
    { name = "astpipeline-process-list-tables",
      filter = _quarto.modules.listtable.list_table_filter(),
      traverser = 'jog',
    },
    
    { name = "astpipeline-process-tables",
      filter = astpipeline_process_tables(),
      traverser = 'jog',
    },
    
    { name = "normalize-combined-1",
      filter = combineFilters({
          extract_latex_quartomarkdown_commands(),
          forward_cell_subcaps(),
          parse_extended_nodes(),
          code_filename(),
          normalize_fixup_data_uri_image_extension(),
          {
            Str = function(el)
                if string.match(el.text, ":::(:*)") then 
                  local error_message = 
                    "\nThe following string was found in the document: " .. el.text .. 
                    "\n\nThis usually indicates a problem with a fenced div in the document. Please check the document for errors."
                  warn(error_message)
                end
            end
          },
      }),
      traverser = 'jog',
    },

    { 
      name = "normalize-combine-2", 
      filter = combineFilters({
          parse_md_in_html_rawblocks(),
          parse_floatreftargets(),
          parse_blockreftargets()
      }),
    },
  }
end
-- extractquartodom.lua
-- Copyright (C) 2023 Posit Software, PBC

local readqmd = require("readqmd")

function normalize_capture_reader_state() 
  return {
    Meta = function(meta)
      quarto_global_state.reader_options = readqmd.meta_to_options(meta.quarto_pandoc_reader_opts)
      meta.quarto_pandoc_reader_opts = nil
      return meta
    end
  }
end
-- fixupdatauri.lua
-- Copyright (C) 2023 Posit Software, PBC

-- https://github.com/quarto-dev/quarto-cli/issues/6568
function normalize_fixup_data_uri_image_extension() 
  return {
    Image = function(img)
      local src = img.src
      if src:sub(1, 5) == "data:" then
        local l = PANDOC_READER_OPTIONS.default_image_extension:len()
        if src:sub(-l-1) == ("." .. PANDOC_READER_OPTIONS.default_image_extension) then
          img.src = src:sub(1, -l - 2)
          return img
        end
      end
    end
  }
end
-- custom.lua
-- Copyright (C) 2023 Posit Software, PBC
--
-- custom crossref categories

function initialize_custom_crossref_categories(meta)
  local cr = meta["crossref"]
  if pandoc.utils.type(cr) ~= "table" then
    return nil
  end
  local custom = cr["custom"]
  if custom == nil then
    return nil
  end
  if type(custom) ~= "table" then
    -- luacov: disable
    fail_and_ask_for_bug_report("crossref.custom entry must be a table")
    return nil
    -- luacov: enable
  end
  flags.has_custom_crossrefs = true
  local keys = {
    ["caption-location"] = function(v) return pandoc.utils.stringify(v) end,
    ["kind"] = function(v) return pandoc.utils.stringify(v) end,
    ["reference-prefix"] = function(v) return pandoc.utils.stringify(v) end,
    ["caption-prefix"] = function(v) return pandoc.utils.stringify(v) end,
    ["key"] = function(v) return pandoc.utils.stringify(v) end,
    ["latex-env"] = function(v) return pandoc.utils.stringify(v) end,
    ["latex-list-of-file-extension"] = function(v) return pandoc.utils.stringify(v) end,
    ["latex-list-of-description"] = function(v) return pandoc.utils.stringify(v) end,
    ["space-before-numbering"] = function(v) return v end,
  }
  local obj_mapping = {
    ["caption-location"] = "caption_location",
    ["reference-prefix"] = "name",
    ["caption-prefix"] = "prefix",
    ["latex-env"] = "latex_env",
    ["latex-list-of-file-extension"] = "latex_list_of_file_extension",
    ["latex-list-of-description"] = "latex_list_of_description",
    ["key"] = "ref_type",
    ["space-before-numbering"] = "space_before_numbering",
  }
  for _, v in ipairs(custom) do
    local entry = {}
    for key, xform in pairs(keys) do
      if v[key] ~= nil then
        entry[key] = xform(v[key])
      end
    end
    if entry["caption-location"] == nil then
      entry["caption-location"] = "bottom"
    end
    -- slightly inefficient because we recompute the indices at
    -- every call, but should be totally ok for the number of categories
    -- we expect to see in documents
    local obj_entry = {}
    for k, v in pairs(entry) do
      if obj_mapping[k] ~= nil then
        obj_entry[obj_mapping[k]] = v
      else
        obj_entry[k] = v
      end
    end
    if obj_entry["prefix"] == nil then
      obj_entry["prefix"] = obj_entry["name"]
    end
    add_crossref_category(obj_entry)

    if quarto.doc.isFormat("pdf") then
      local function as_latex(inlines)
        return trim(pandoc.write(pandoc.Pandoc(inlines), "latex"))
      end
      local function emit_warning(msg)
        warn(msg)
        quarto.log.output(entry)
        warn("Compilation will continue, but the output is likely going to be incorrect.")
      end
      metaInjectLatex(meta, function(inject)
        local ref_type = entry["key"]
        if ref_type == nil then
          emit_warning("field 'key' is required for custom crossref environments, but is missing for the following entry:")
          return
        end
        local env_name = entry["latex-env"]
        if env_name == nil then
          emit_warning("field 'latex-env' is required for custom crossref environments, but is missing for the following entry:")
        end
        local name = entry["reference-prefix"]
        local env_prefix = entry["caption-prefix"] or name
        if env_prefix == nil then
          emit_warning("fields 'caption-prefix' or 'reference-prefix' are required for custom crossref environments, but are missing for the following entry:")
        end
        local list_of_name = entry["latex-list-of-file-extension"] or ("lo" .. ref_type)
        local list_of_description = entry["latex-list-of-description"] or name
        local cap_location = entry["caption-location"] or "bottom"
        local space_before_numbering = entry["space-before-numbering"]
        if space_before_numbering == nil then
          space_before_numbering = true
        end

        -- https://github.com/quarto-dev/quarto-cli/issues/8711#issuecomment-1946763141
        -- using the name 'output' for a new float environment
        -- very specifically causes problems with the longtable package, so we disallow it here.
        --
        -- I'd like to disallow this value in our schema, but it would involve negation assertions
        -- which we currently don't support
        if env_name == "output" then
          fail("The value 'output' is not allowed for the latex-env entry in a custom float environment,\nas it conflicts with the longtable package. Please choose a different value.")
          return
        end
        
        inject(
        usePackage("float") .. "\n" ..
        "\\floatstyle{plain}\n" ..
        "\\@ifundefined{c@chapter}{\\newfloat{" .. env_name .. "}{h}{" .. list_of_name .. "}}{\\newfloat{" .. env_name .. "}{h}{" .. list_of_name .. "}[chapter]}\n" ..
        "\\floatname{".. env_name .. "}{" .. as_latex(title(ref_type, env_prefix)) .. "}\n"
        )

        if cap_location == "top" then
          inject("\\floatstyle{plaintop}\n\\restylefloat{" .. env_name .. "}\n")
        end

        -- FIXME this is a bit of hack for the case of custom categories with
        -- space-before-numbering: false
        --
        -- the real unlock here is the custom ref command, which we should
        -- eventually just make extensible entirely by the user
        --
        -- and we should probably be using cleveref instead of hyperref

        if not space_before_numbering and name:match(" ") then
          -- extract last word from name
          local last_word = name:match("([^ ]+)$")
          local first_words = name:sub(1, #name - #last_word - 1)
          local custom_cmd_name = "quarto" .. ref_type .. "ref"
          local ref_command = "\\newcommand*\\" .. custom_cmd_name .. "[1]{" .. first_words .. " \\hyperref[#1]{" .. last_word .. "\\ref{#1}}}"
          inject(ref_command)

          -- mark crossref category as having a custom ref command
          -- so we can use it in the rendering
          crossref.categories.by_ref_type[ref_type].custom_ref_command = custom_cmd_name


          -- inject the caption package includes here because they need to appear before DeclareCaptionFormat
          inject(usePackage("caption"))
          -- also declare a custom caption format in this case, so caption
          -- format also skips spaces:
          inject("\\DeclareCaptionLabelFormat{" .. custom_cmd_name .. "labelformat}{#1#2}")
          inject("\\captionsetup[" .. env_name .. "]{labelformat=" .. custom_cmd_name .. "labelformat}")
        end

        inject(
          "\\newcommand*\\listof" .. env_name .. "s{\\listof{" .. env_name .. "}{" .. listOfTitle(list_of_name, "List of " .. list_of_description .. "s") .. "}}\n"
        )
      end)
    end
  end
end
-- index.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- initialize the index
function initCrossrefIndex()
     
  -- compute section offsets
  local sectionOffsets = pandoc.List({0,0,0,0,0,0,0})
  local numberOffset = pandoc.List(param("number-offset", {}))
  for i=1,#sectionOffsets do
    if i > #numberOffset then
      break
    end
    sectionOffsets[i] = numberOffset[i]
  end
  
  -- initialize index
  crossref.index = {
    nextOrder = {},
    nextSubrefOrder = 1,
    section = sectionOffsets:clone(),
    sectionOffsets = sectionOffsets:clone(),
    numberOffset = sectionOffsets:clone(),
    entries = {},
    headings = pandoc.List()
  }
  
end

-- advance a chapter
function indexNextChapter(index, appendix)
   -- reset nextOrder to 1 for all types if we are in chapters mode
  if crossrefOption("chapters", false) then
    -- reset all of the cross type counters
    for k,v in pairs(crossref.index.nextOrder) do
      crossref.index.nextOrder[k] = 1
    end
  end
  -- if this is an appendix the note the start index
  if appendix == true and crossref.startAppendix == nil then
    crossref.startAppendix = index
  end
end

-- next sequence in index for type
function indexNextOrder(type)
  if not crossref.index.nextOrder[type] then
    crossref.index.nextOrder[type] = 1
  end
  local nextOrder = crossref.index.nextOrder[type]
  crossref.index.nextOrder[type] = crossref.index.nextOrder[type] + 1
  crossref.index.nextSubrefOrder = 1
  return {
    section = crossref.index.section:clone(),
    order = nextOrder
  }
end

function indexAddHeading(identifier)
  if identifier ~= nil and identifier ~= '' then
    crossref.index.headings:insert(identifier)
  end
end

-- add an entry to the index
function indexAddEntry(label, parent, order, caption, appendix)
  if caption ~= nil then
    caption = quarto.utils.as_blocks(caption)
  else
    caption = pandoc.Blocks({})
  end
  crossref.index.entries[label] = {
    parent = parent,
    order = order,
    caption = caption,
    appendix = appendix
  }
end

-- advance a subref
function nextSubrefOrder()
  local order = { section = nil, order = crossref.index.nextSubrefOrder }
  crossref.index.nextSubrefOrder = crossref.index.nextSubrefOrder + 1
  return order
end

-- does our index already contain this element?
function indexHasElement(el)
  return crossref.index.entries[el.attr.identifier] ~= nil
end


-- filter to write the index
function writeIndex()
  return {
    Pandoc = function(doc)
      local indexFile = param("crossref-index-file")
      if indexFile ~= nil then
        if isQmdInput() then
          writeKeysIndex(indexFile)
        else
          writeFullIndex(indexFile, doc)
        end   
      end
    end
  }
end

local function index_caption(v)
  if #v.caption > 0 then
    return inlinesToString(quarto.utils.as_inlines(v.caption))
  else
    return ""
  end
end

function writeKeysIndex(indexFile)
  local index = {
    entries = pandoc.List(),
  }
  for k,v in pairs(crossref.index.entries) do
    -- create entry 
    local entry = {
      key = k,
      caption = index_caption(v)
    }
    -- add entry
    index.entries:insert(entry)
  end
 
  -- write the index
  local json = quarto.json.encode(index)
  local file = io.open(indexFile, "w")
  if file then
    file:write(json)
    file:close()
  else
    warn('Error attempting to write crossref index')
  end
end


function writeFullIndex(indexFile, doc)
  -- create an index data structure to serialize for this file 
  local index = {
    entries = pandoc.List(),
    headings = crossref.index.headings:clone()
  }

  -- add options if we have them
  if next(crossref.options) then
    index.options = {}
    for k,v in pairs(crossref.options) do
      if type(v) == "table" then
        if tisarray(v) and pandoc.utils.type(v) ~= "Inlines" then
          index.options[k] = v:map(function(item) return pandoc.utils.stringify(item) end)
        else
          index.options[k] = pandoc.utils.stringify(v)
        end
      else
        index.options[k] = v
      end
    end
  end

  -- write a special entry if this is a multi-file chapter with an id
  local chapterId = crossrefOption("chapter-id")
  
  if chapterId then
    chapterId = pandoc.utils.stringify(chapterId)

     -- chapter heading
    index.headings:insert(chapterId)

    -- chapter entry
    if refType(chapterId) == "sec" and param("number-offset") ~= nil then
      local chapterEntry = {
        key = chapterId,
        parent = nil,
        order = {
          number = 1,
          section = crossref.index.numberOffset
        },
        caption = pandoc.utils.stringify(doc.meta.title)
      }
      index.entries:insert(chapterEntry)
    end
  end

  for k,v in pairs(crossref.index.entries) do
    -- create entry 
    local entry = {
      key = k,
      parent = v.parent,
      order = {
        number = v.order.order,
      },
      caption = index_caption(v)
    }
    -- add section if we have one
    if v.order.section ~= nil then
      entry.order.section = v.order.section
    end
    -- add entry
    index.entries:insert(entry)
  end
 
  -- write the index
  local json = quarto.json.encode(index)
  local file = io.open(indexFile, "w")
  if file then
    file:write(json)
    file:close()
  else
    warn('Error attempting to write crossref index')
  end
end
-- preprocess.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- figures and tables support sub-references. mark them up before
-- we proceed with crawling for cross-refs
function crossref_mark_subfloats()
  return {
    traverse = "topdown",
    FloatRefTarget = function(float)
      float.content = _quarto.ast.walk(float.content or pandoc.Blocks{}, {
        FloatRefTarget = function(subfloat)
          float.has_subfloats = true
          crossref.subfloats[subfloat.identifier] = {
            parent_id = float.identifier
          }
          subfloat.parent_id = float.identifier
          subfloat.content = _quarto.ast.walk(subfloat.content, {
            Image = function(image)
              image.attributes[kRefParent] = float.identifier
              return image
            end
          })
          return subfloat
        end
      })
      return float, false
    end
  }
end
-- sections.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

function sections()
  
  return {
    Header = function(el)
      
      -- index the heading
      indexAddHeading(el.attr.identifier)

      -- skip unnumbered
      if (el.classes:find("unnumbered")) then
        return el
      end
      
      -- cap levels at 7
      local level = math.min(el.level, 7)
      
      -- get the current level
      local currentLevel = currentSectionLevel()
      
      -- if this level is less than the current level
      -- then set subsequent levels to their offset
      if level < currentLevel then
        for i=level+1,#crossref.index.section do
          crossref.index.section[i] = crossref.index.sectionOffsets[i]
        end
      end
      
      -- increment the level counter
      crossref.index.section[level] = crossref.index.section[level] + 1
      
      -- if this is a chapter then notify the index (will be used to 
      -- reset type-counters if we are in "chapters" mode)
      if level == 1 then
        indexNextChapter(crossref.index.section[level], currentFileMetadataState().appendix)
      end
      
      -- if this has a section identifier then index it
      if refType(el.attr.identifier) == "sec" then
        local order = indexNextOrder("sec")
        indexAddEntry(el.attr.identifier, nil, order, el.content, currentFileMetadataState().appendix)
      end

      -- if the number sections option is enabled then emulate pandoc numbering
      local section = sectionNumber(crossref.index.section, level)
      if not _quarto.format.isEpubOutput() and numberSectionsOptionEnabled() and level <= numberDepth() then
        el.attr.attributes["number"] = section
      end
      
      -- number the section if required
      if (numberSections() and level <= numberDepth()) then
        local appendix = (level == 1) and currentFileMetadataState().appendix
        if appendix then
          el.content:insert(1, pandoc.Space())
          tprepend(el.content, crossrefOption("appendix-delim", stringToInlines(" —")))
        elseif level == 1 and not _quarto.format.isHtmlOutput() then
          el.content:insert(1, pandoc.Str(". "))
        else
          el.content:insert(1, pandoc.Space())
        end

        if _quarto.format.isHtmlOutput() then
          el.content:insert(1, pandoc.Span(
            stringToInlines(section),
            pandoc.Attr("", { "header-section-number"})
          ))
        else
          tprepend(el.content, stringToInlines(section))
        end

        if appendix then
          el.content:insert(1, pandoc.Space())
          tprepend(el.content, crossrefOption("appendix-title", stringToInlines("Appendix")))
        end

      end
      
      -- return 
      return el
    end
  }
end

function currentSectionLevel()
  -- scan backwards for the first non-zero section level
  for i=#crossref.index.section,1,-1 do
    local section = crossref.index.section[i]
    if section ~= 0 then
      return i
    end
  end
  
  -- if we didn't find one then we are at zero (no sections yet)
  return 0
end

function numberSections()
  return (not _quarto.format.isLatexOutput() or _quarto.format.isBeamerOutput()) and 
         not _quarto.format.isTypstOutput() and
         not _quarto.format.isMarkdownOutput() 
         and numberSectionsOptionEnabled()
end

function numberSectionsOptionEnabled()
  return param("number-sections", false)
end

function numberDepth() 
  return param("number-depth", 6)
end

-- figures.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- process all figures
function crossref_figures()
  return {
    -- process a float
    -- adding it to the global index of floats (figures, tables, etc)
    --
    -- in 1.4, we won't re-write its caption here, but instead we'll
    -- do it at the render filter.

    FloatRefTarget = function(float)
      -- if figure is unlabeled, do not process
      if is_unlabeled_float(float) then
        return nil
      end

      -- get label and base caption
      -- local label = el.attr.identifier
      local kind = ref_type_from_float(float)
      if kind == nil then
        internal_error()
      end
    
      -- determine order, parent, and displayed caption
      local order
      local parent = float.parent_id
      if (parent) then
        order = nextSubrefOrder()
      else
        order = indexNextOrder(kind)
      end
    
      float.order = order
      -- update the index
      indexAddEntry(float.identifier, parent, order, {float.caption_long})
      return float
    end
  }
end

-- tables.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- process all tables (note that cross referenced tables are *always*
-- wrapped in a div so they can carry parent information and so that
-- we can create a hyperef target for latex)

local patterns = require("modules/patterns")

function preprocessRawTableBlock(rawEl, parentId)
  
  local function divWrap(el, label, caption)
    local div = pandoc.Div(el, pandoc.Attr(label))
    if parentId then
      div.attr.attributes[kRefParent] = parentId
      if caption then
        div.content:insert(pandoc.Para(stringToInlines(caption)))
      end
    end
    return div
  end
  
  if _quarto.format.isRawHtml(rawEl) and _quarto.format.isHtmlOutput() then
    local captionPattern = patterns.html_table_caption
    local _, caption, _ = string.match(rawEl.text, captionPattern) 
    if caption then
      -- extract id if there is one
      local caption, label = extractRefLabel("tbl", caption)
      if label then
        -- remove label from caption
        rawEl.text = rawEl.text:gsub(captionPattern, "%1" .. caption:gsub("%%", "%%%%") .. "%3", 1)
      elseif parentId then
        label = autoSubrefLabel(parentId)
      end
        
      if label then
        return divWrap(rawEl, label)
      end
    end
  elseif _quarto.format.isRawLatex(rawEl) and _quarto.format.isLatexOutput() then
    
    -- remove knitr label
    local knitrLabelPattern = "\\label{tab:[^}]+} ?"
    rawEl.text = rawEl.text:gsub(knitrLabelPattern, "", 1)
    
    -- try to find a caption with an id
    local captionPattern = "(\\caption{)(.*)" .. refLabelPattern("tbl") .. "([^}]*})"
    local _, caption, label, _ = rawEl.text:match(captionPattern)
    if label then
      -- remove label from caption
      rawEl.text = rawEl.text:gsub(captionPattern, "%1%2%4", 1)
    elseif parentId then
      label = autoSubrefLabel(parentId)
    end
      
    if label then
      return divWrap(rawEl, label)
    end
      
  end
  
  return rawEl
  
end

function preprocessTable(el, parentId)
  
 -- if there is a caption then check it for a table suffix
  if el.caption.long ~= nil then
    local last = el.caption.long[#el.caption.long]
    if last and #last.content > 0 then
       -- check for tbl label
      local label = nil
      local caption, attr = parseTableCaption(last.content)
      if startsWith(attr.identifier, "tbl-") then
        -- set the label and remove it from the caption
        label = attr.identifier
        attr.identifier = ""
        last.content = createTableCaption(caption, attr)
   
        -- provide error caption if there is none
        if #last.content == 0 then
          if parentId then
            tappend(last.content, { emptyCaption() })
          else
            tappend(last.content, { noCaption() })
          end
        end
        
      -- if there is a parent then auto-assign a label if there is none 
      elseif parentId then
        label = autoSubrefLabel(parentId)
      end
     
      if label then
        -- wrap in a div with the label (so that we have a target
        -- for the tbl ref, in LaTeX that will be a hypertarget)
        local div = pandoc.Div(el, pandoc.Attr(label))
        
        -- propagate parent id if the parent is a table
        if parentId and isTableRef(parentId) then
          div.attr.attributes[kRefParent] = parentId
        end
        
        -- return the div
        return div
      end
    end
  end
  return el
end


function process(float)
  local changed = false
  local content = float.content
  if pandoc.utils.type(content) ~= "Blocks" then
    content = pandoc.List({content})
  end
  for _,el in ipairs(content) do
    if el.t == "Table" then
      if el.caption.long ~= nil and #el.caption.long > 0 then
        local label = divEl.attr.identifier
        local caption = el.caption.long[#el.caption.long]
        processMarkdownTableEntry(float)
        changed = true
        return float
      end
    end
  end
  if changed then
    return float
  end
  return nil
end

function processMarkdownTableEntry(float)
  
  -- clone the caption so we can add a clean copy to our index
  local captionClone = caption.content:clone()

  -- determine order / insert prefix
  local order
  local parent = float.parent_id
  if (parent) then
    order = nextSubrefOrder()
    prependSubrefNumber(caption.content, order)
  else
    order = indexNextOrder("tbl")
    prependTitlePrefix(caption, label, order)
  end

  -- add the table to the index
  indexAddEntry(label, parent, order, captionClone)
  
end



function processRawTable(divEl)
  -- look for a raw html or latex table
  for i,el in pairs(divEl.content) do
    local rawParentEl, rawEl, rawIndex = rawElement(divEl, el, i)
    if rawEl then
      local label = divEl.attr.identifier
      -- html table
      if _quarto.format.isRawHtml(rawEl) then
        local captionPattern = patterns.html_table_caption
        local _, caption, _ = string.match(rawEl.text, captionPattern)
        if caption then
          
          local order
          local prefix
          local parent = divEl.attr.attributes[kRefParent]
          if (parent) then
            order = nextSubrefOrder()
            local subref = pandoc.List()
            prependSubrefNumber(subref, order)
            prefix = inlinesToString(subref)
          else
            order = indexNextOrder("tbl")
            prefix = pandoc.utils.stringify(tableTitlePrefix(order))
          end
          
          indexAddEntry(label, parent, order, stringToInlines(caption))
        
          rawEl.text = rawEl.text:gsub(captionPattern, "%1" .. prefix .. " %2%3", 1)
          rawParentEl.content[rawIndex] = rawEl
          return divEl
        end
      -- latex table
      elseif _quarto.format.isRawLatex(rawEl) then
        
        -- look for raw latex with a caption
        captionPattern = "\\caption{([^}]+)}"
        caption = string.match(rawEl.text, captionPattern)
        if caption then
           processLatexTable(divEl, rawEl, captionPattern, label, caption)
           rawParentEl.content[rawIndex] = rawEl
           return divEl
        end
      end
      break
    end
  end

  return nil
end

-- handle either a raw block or raw inline in first paragraph
function rawElement(divEl, el, index)
  if el.t == "RawBlock" then
    return divEl, el, index
  elseif el.t == "Para" and #el.content > 0 and el.content[1].t == "RawInline" then
    return el, el.content[1], 1
  end
end

-- is this a Div containing a table?
function isTableDiv(el)
  return is_regular_node(el, "Div") and hasTableRef(el)
end


function float_title_prefix(float, withDelimiter)
  local category = crossref.categories.by_name[float.type]
  if category == nil then
    fail("unknown float type '" .. float.type .. "'")
    return
  end
  if float.order == nil then
    warn("field 'order' is missing from float. Cannot determine title prefix for crossref.")
    return {}
  end
  
  return titlePrefix(category.ref_type, category.name, float.order, withDelimiter)
end

function tableTitlePrefix(order)
  return titlePrefix("tbl", "Table", order)
end


function processLatexTable(divEl, el, captionPattern, label, caption)
  
  local order
  local parent = divEl.attr.attributes[kRefParent]
  if (parent) then
    el.text = el.text:gsub(captionPattern, "", 1)
    divEl.content:insert(pandoc.Para(stringToInlines(caption)))
    order = nextSubrefOrder()
  else
    el.text = el.text:gsub(captionPattern, "\\caption{\\label{" .. label .. "}" .. caption:gsub("%%", "%%%%") .. "}", 1)
    order = indexNextOrder("tbl")
  end
  
  indexAddEntry(label, parent, order, stringToInlines(caption))
end

function prependTitlePrefix(caption, label, order)
  if _quarto.format.isLatexOutput() then
     tprepend(caption.content, {
       pandoc.RawInline('latex', '\\label{' .. label .. '}')
     })
  elseif not _quarto.format.isAsciiDocOutput() then
     tprepend(caption.content, tableTitlePrefix(order))
  end
end


-- equations.lua
-- Copyright (C) 2020-2026 Posit Software, PBC

-- process all equations
function equations()
  return {
    Para = process_equations,
    Plain = process_equations
  }
end

function process_equations(blockEl)

  -- alias inlines
  local inlines = blockEl.content

  -- do nothing if there is no math herein
  if inlines:find_if(isDisplayMath) == nil then
    return nil
  end

  local mathInlines = nil
  local targetInlines = pandoc.Inlines{}
  local skipUntil = 0

  for i, el in ipairs(inlines) do
    -- see if we need special handling for pending math, if
    -- we do then track whether we should still process the
    -- inline at the end of the loop
    local processInline = true

    -- Skip elements that were consumed as part of a multi-element attribute block
    if i <= skipUntil then
      processInline = false
      goto continue
    end
    if mathInlines then
      if el.t == "Space" then
        mathInlines:insert(el)
        processInline = false
      -- Check "starts with" not complete match: Pandoc splits {#eq-label alt="..."} across elements
      elseif el.t == "Str" and el.text:match("^{#eq%-") then
        -- Collect attribute block: {#eq-label alt="..."} may span multiple elements
        local attrText, consumed = collectAttrBlock(inlines, i)

        if attrText then
          -- Parse to extract label and optional attributes (e.g., alt for Typst)
          local label, attributes = parseRefAttr(attrText)
          if not label then
            local _, extracted = extractRefLabel("eq", attrText)
            label = extracted
          end

          local order = indexNextOrder("eq")
          indexAddEntry(label, nil, order)

          local eq = mathInlines[1]
          local alt = attributes and attributes["alt"] or nil
          local eqInlines = renderEquation(eq, label, alt, order)
          targetInlines:extend(eqInlines)

          -- Skip consumed elements and reset state
          skipUntil = i + consumed - 1
          mathInlines = nil
          processInline = false
        else
          targetInlines:extend(mathInlines)
          mathInlines = nil
        end
      else
        targetInlines:extend(mathInlines)
        mathInlines = nil
      end
    end
    ::continue::

    -- process the inline unless it was already taken care of above
    if processInline then
      if isDisplayMath(el) then
          mathInlines = pandoc.List()
          mathInlines:insert(el)
        else
          targetInlines:insert(el)
      end
    end

  end

  -- flush any pending math inlines
  if mathInlines then
    targetInlines:extend(mathInlines)
  end

  -- return the processed list
  blockEl.content = targetInlines
  return blockEl

end

-- Render equation output for all formats.
-- The alt parameter is only used for Typst output (accessibility).
function renderEquation(eq, label, alt, order)
  local result = pandoc.Inlines{}

  if _quarto.format.isLatexOutput() then
    result:insert(pandoc.RawInline("latex", "\\begin{equation}"))
    result:insert(pandoc.Span(pandoc.RawInline("latex", eq.text), pandoc.Attr(label)))

    -- Pandoc 3.1.7 started outputting a shadow section with a label as a link target
    -- which would result in two identical labels being emitted.
    -- https://github.com/jgm/pandoc/issues/9045
    -- https://github.com/lierdakil/pandoc-crossref/issues/402
    result:insert(pandoc.RawInline("latex", "\\end{equation}"))

  elseif _quarto.format.isTypstOutput() then
    local is_block = eq.mathtype == "DisplayMath" and "true" or "false"
    -- Escape quotes in alt text for Typst string literal
    -- First normalize curly quotes to straight quotes (Pandoc may apply smart quotes)
    local alt_param = ""
    if alt then
      local escaped_alt = alt:gsub("“", '"'):gsub("”", '"')
      escaped_alt = escaped_alt:gsub("‘", "'"):gsub("’", "'")
      escaped_alt = escaped_alt:gsub('"', '\\"')
      alt_param = ", alt: \"" .. escaped_alt .. "\""
    end
    -- Use equation-numbering variable defined in template
    -- (simple "(1)" for articles, chapter-based function for books)
    result:insert(pandoc.RawInline("typst",
      "#math.equation(block: " .. is_block .. ", numbering: equation-numbering" .. alt_param .. ", [ "))
    result:insert(eq)
    result:insert(pandoc.RawInline("typst", " ])<" .. label .. ">"))

  else
    local eqNumber = eqQquad
    local mathMethod = param("html-math-method", nil)
    if type(mathMethod) == "table" and mathMethod["method"] then
      mathMethod = mathMethod["method"]
    end
    if _quarto.format.isHtmlOutput() and (mathMethod == "mathjax" or mathMethod == "katex") then
      eqNumber = eqTag
    end
    eq.text = eq.text .. " " .. eqNumber(inlinesToString(numberOption("eq", order)))
    result:insert(pandoc.Span(eq, pandoc.Attr(label)))
  end

  return result
end

function eqTag(eq)
  return "\\tag{" .. eq .. "}"
end

function eqQquad(eq)
  return "\\qquad(" .. eq .. ")"
end

function isDisplayMath(el)
  return el.t == "Math" and el.mathtype == "DisplayMath"
end


-- Collect a complete attribute block from inline elements.
--
-- Pandoc tokenises `{#eq-label alt="description"}` into multiple elements:
--   Str "{#eq-label", Space, Str "alt=", Quoted [...], Str "}"
--
-- This function reassembles these elements into a single string for parseRefAttr().
-- Quoted elements are reconstructed with escaped inner quotes to preserve the
-- original attribute syntax.
--
-- Returns: collected text (string), number of elements consumed (number)
function collectAttrBlock(inlines, startIndex)
  local first = inlines[startIndex]
  if not first or first.t ~= "Str" then
    return nil, 0
  end

  local collected = first.text
  local consumed = 1

  if collected:match("}$") then
    return collected, consumed
  end

  for j = startIndex + 1, #inlines do
    local el = inlines[j]
    if el.t == "Str" then
      collected = collected .. el.text
      consumed = consumed + 1
    elseif el.t == "Space" then
      collected = collected .. " "
      consumed = consumed + 1
    elseif el.t == "Quoted" then
      local quote = el.quotetype == "DoubleQuote" and '"' or "'"
      local content = pandoc.utils.stringify(el.content)
      if el.quotetype == "DoubleQuote" then
        content = content:gsub('"', '\\"')
      else
        content = content:gsub("'", "\\'")
      end
      collected = collected .. quote .. content .. quote
      consumed = consumed + 1
    else
      break
    end
    if collected:match("}$") then
      break
    end
  end

  if collected:match("^{#eq%-[^}]+}$") then
    return collected, consumed
  end

  return nil, 0
end


-- Parse a Pandoc attribute block string into identifier and attributes.
--
-- Uses pandoc.read() with a dummy header to leverage Pandoc's native attribute
-- parser, avoiding fragile regex-based parsing.
--
-- Single-quoted attributes (e.g., alt='text') must be converted to double quotes
-- because Pandoc's attribute syntax only supports double-quoted values.
-- The conversion uses a three-step process:
--   1. Protect escaped single quotes (\') with a placeholder.
--   2. Convert key='value' to key="value", escaping any internal double quotes.
--   3. Restore any remaining placeholders to literal single quotes.
--
-- Returns: identifier (string), attributes (table)
function parseRefAttr(text)
  if not text then return nil, nil end

  local placeholder = "\x00ESC_SQUOTE\x00"
  text = text:gsub("\\'", placeholder)
  text = text:gsub("(%w+)='([^']*)'", function(key, value)
    value = value:gsub(placeholder, "'")
    value = value:gsub('"', '\\"')
    return key .. '="' .. value .. '"'
  end)
  text = text:gsub(placeholder, "'")

  -- Normalise spaces around = in attributes (alt = "value" -> alt="value")
  text = text:gsub("(%w+)%s*=%s*(['\"])", "%1=%2")

  local parsed = pandoc.read("## " .. text, "markdown")
  if parsed and parsed.blocks[1] and parsed.blocks[1].attr then
    local attr = parsed.blocks[1].attr
    return attr.identifier, attr.attributes
  end
  return nil, nil
end
-- theorems.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- preprocess theorem to ensure that embedded headings are unnumered
function crossref_preprocess_theorems()
  return {
    Div = function(el)
      local type = refType(el.attr.identifier)
      if theorem_types[type] ~= nil or proof_type(el) ~= nil then
        return _quarto.ast.walk(el, {
          Header = function(el)
            el.classes:insert("unnumbered")
            return el
          end
        })
      end
    end
  }
end

function crossref_theorems()
  return {
    Theorem = function(thm)
      local label = thm.identifier
      local type = refType(label)
      local title = quarto.utils.as_blocks(thm.name)
      thm.order = add_crossref(label, type, title)
      return thm
    end,
    Proof = function(proof)
      local label = proof.identifier
      if label == "" then
        return nil -- it's an unnumbered proof
      end
      local type = refType(label)
      local title = quarto.utils.as_blocks(proof.name)
      proof.order = add_crossref(label, type, title)
      return proof
    end,
    Div = function(el)
      local type = refType(el.attr.identifier)
      local theoremType = theorem_types[type]
      if theoremType then
        internal_error()
      else
        -- see if this is a proof, remark, or solution
        local proof = proof_type(el)
        if proof ~= nil then

          -- ensure requisite latex is injected
          crossref.using_theorems = true

          if proof.env ~= "proof" then
            el.attr.classes:insert("proof")
          end

          -- capture then remove name
          -- 
          -- we have string_to_quarto_ast_inlines but we don't need it here
          -- because this filter happened after shortcode processing, and this
          -- is a regular div we're processing
          local name = markdownToInlines(el.attr.attributes["name"])
          if not name or #name == 0 then
            name = resolveHeadingCaption(el)
          end
          el.attr.attributes["name"] = nil 

          -- output
          if _quarto.format.isLatexOutput() then
            local preamble = pandoc.List()
            preamble:insert(pandoc.RawInline("latex", "\\begin{" .. proof.env .. "}"))
            if name ~= nil then
              preamble:insert(pandoc.RawInline("latex", "["))
              tappend(preamble, name)
              preamble:insert(pandoc.RawInline("latex", "]"))
            end
            preamble:insert(pandoc.RawInline("latex", "\n"))
            -- https://github.com/quarto-dev/quarto-cli/issues/6077
            if el.content[1].t == "Para" then
              preamble:extend(el.content[1].content)
              el.content[1].content = preamble
            else
              if (el.content[1].t ~= "Para") then
                -- required trick to get correct alignement when non Para content first
                preamble:insert(pandoc.RawInline('latex', "\\leavevmode"))
              end
              el.content:insert(1, pandoc.Plain(preamble))
            end
            local end_env = "\\end{" .. proof.env .. "}"
            -- https://github.com/quarto-dev/quarto-cli/issues/6077
            if el.content[#el.content].t == "Para" then
              el.content[#el.content].content:insert(pandoc.RawInline("latex", "\n" .. end_env))
            elseif el.content[#el.content].t == "RawBlock" and el.content[#el.content].format == "latex" then
              -- this is required for no empty line between end_env and previous latex block
              el.content[#el.content].text = el.content[#el.content].text .. "\n" .. end_env
            else
              el.content:insert(pandoc.RawBlock("latex", end_env))
            end
          elseif _quarto.format.isJatsOutput() then
            el = jatsTheorem(el,  nil, name )
          else
            local span = pandoc.Span(
              { pandoc.Emph(pandoc.Str(envTitle(proof.env, proof.title)))},
              pandoc.Attr("", { "proof-title" })
            )
            if name ~= nil then
              span.content:insert(pandoc.Str(" ("))
              tappend(span.content, name)
              span.content:insert(pandoc.Str(")"))
            end
            tappend(span.content, { pandoc.Str(". ")})

            -- if the first block is a paragraph, then prepend the title span
            if #el.content > 0 and 
               el.content[1].t == "Para" and
               el.content[1].content ~= nil and 
               #el.content[1].content > 0 then
              el.content[1].content:insert(1, span)
            else
              -- else insert a new paragraph
              el.content:insert(1, pandoc.Para{span})
            end
          end

        end

      end
     
      return el
    
    end
  }

end

function jatsTheorem(el, label, title) 

  -- <statement>
  --   <label>Equation 2</label>
  --   <title>The Pythagorean</title>
  --   <p>
  --     ...
  --   </p>
  -- </statement> 

  if #title > 0 then
    tprepend(el.content, {
      pandoc.RawBlock("jats", "<title>"),  
      pandoc.Plain(title), 
      pandoc.RawBlock("jats", "</title>")})
  end

  if label then
    tprepend(el.content, {
      pandoc.RawBlock("jats", "<label>"),  
      pandoc.Plain(label), 
      pandoc.RawBlock("jats", "</label>")})
  end
  
  -- Process the caption (if any)
  
  -- Emit the statement
  local stmtPrefix = pandoc.RawBlock("jats",  '<statement id="' .. el.attr.identifier .. '">')
  local stmtSuffix = pandoc.RawBlock("jats",  '</statement>')

  el.content:insert(1, stmtPrefix)
  el.content:insert(stmtSuffix)
  return el
end

function captionPrefix(name, type, theoremType, order) 
  local prefix = title(type, theoremType.title)
  table.insert(prefix, pandoc.Space())
  tappend(prefix, numberOption(type, order))
  if #name > 0 then
    table.insert(prefix, pandoc.Space())
    table.insert(prefix, pandoc.Str("("))
    tappend(prefix, name)
    table.insert(prefix, pandoc.Str(")"))
  end
  return prefix
end


-- theorem latex includes
function theoremLatexIncludes()
  
  -- determine which theorem types we are using
  local using_theorems = crossref.using_theorems
  for k,v in pairs(crossref.index.entries) do
    local type = refType(k)
    if theorem_types[type] then
      using_theorems = true
      theorem_types[type].active = true
    end
  end
  
  -- return requisite latex if we are using theorems
  if using_theorems then
    local secType 
    if crossrefOption("chapters", false) then 
      secType = "chapter" 
    else 
      secType = "section" 
    end
    local theoremIncludes = "\\usepackage{amsthm}\n"
    for _, type in ipairs(tkeys(theorem_types)) do
      if theorem_types[type].active then
        theoremIncludes = theoremIncludes .. 
          "\\theoremstyle{" .. theorem_types[type].style .. "}\n" ..
          "\\newtheorem{" .. theorem_types[type].env .. "}{" .. 
          titleString(type, theorem_types[type].title) .. "}[" .. secType .. "]\n"
      end
    end
    theoremIncludes = theoremIncludes ..
      "\\theoremstyle{remark}\n" ..
      "\\AtBeginDocument{\\renewcommand*{\\proofname}{" .. envTitle("proof", "Proof") .. "}}\n" ..
      "\\newtheorem*{remark}{" .. envTitle("remark", "Remark") .. "}\n" ..
      "\\newtheorem*{solution}{" .. envTitle("solution", "Solution") .. "}\n" ..
      "\\newtheorem{refremark}{" .. envTitle("remark", "Remark") .. "}[" .. secType .. "]\n" ..
      "\\newtheorem{refsolution}{" .. envTitle("solution", "Solution") .. "}[" .. secType .. "]\n"

    return theoremIncludes
  else
    return nil
  end
end

-- qmd.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

function isQmdInput()
  return param("crossref-input-type", "md") == "qmd"
end

function qmd()
  if isQmdInput() then
    return {
      -- for qmd, look for label: and fig-cap: inside code block text
      CodeBlock = function(el)
        local label = el.text:match("|%slabel:%s(%a+%-[^\n]+)\n")
        if label ~= nil and (isFigureRef(label) or isTableRef(label)) then
          local type, caption = parseCaption(label, el.text)
          if type == "fig" or type == "tbl" then
            local order = indexNextOrder(type)
            indexAddEntry(label, nil, order, stringToInlines(caption))
          end
        end
        return el
      end
    }
  else
    return {}
  end
end

function parseCaption(label, elText)
  local type, caption = elText:match("|%s(%a+)%-cap:%s(.-)\n")
  if caption ~= nil then
    -- remove enclosing quotes (if any)
    if caption:sub(1, 1) == '"' then
      caption = caption:sub(2, #caption)
    end
    if caption:sub(#caption, #caption) == '"' then
      caption = caption:sub(1, #caption - 1)
    end
    -- replace escaped quotes
    caption = caption:gsub('\\"', '"')

    -- return
    return type, caption
  else
    return nil
  end
  
end
-- refs.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- FIXME this resolveRefs filter should be in post-processing
-- since it emits format-specific AST elements

-- resolve references
function resolveRefs()
  
  return {
    Cite = function(citeEl)

      local function add_ref_prefix(ref, ref_type, prefix)
        local category = crossref.categories.by_ref_type[ref_type]
        ref:extend(prefix)
        if (category == nil or category.space_before_numbering ~= false) and not _quarto.format.isTypstOutput() then
          ref:extend({nbspString()})
        end
      end
    
      -- all valid ref types (so we can provide feedback when one doesn't match)
      local refTypes = valid_ref_types()
      
      -- scan citations for refs
      local refs = pandoc.Inlines({})
      for i, cite in ipairs (citeEl.citations) do
        -- get the label and type, and note if the label is uppercase
        local label = cite.id
        local type = refType(label)
        if type ~= nil and is_valid_ref_type(type) then
          local upper = not not string.match(cite.id, "^[A-Z]")

          -- convert the first character of the label to lowercase for lookups
          label = pandoc.text.lower(label:sub(1, 1)) .. label:sub(2)
        
          -- lookup the label
          local resolve = param("crossref-resolve-refs", true)
          local entry = crossref.index.entries[label]
          if entry ~= nil or not resolve then
        
            -- preface with delimiter unless this is citation 1
            if (i > 1) then
              refs:extend(refDelim())
              refs:extend(stringToInlines(" "))
            end
  
            -- create ref text
            local ref = pandoc.List()

            local category = crossref.categories.by_ref_type[type]
            if category ~= nil and category.custom_ref_command ~= nil and _quarto.format.isLatexOutput() then
              -- do nothing else, this was all handled by the custom command
              ref:extend({pandoc.RawInline('latex', '\\' .. category.custom_ref_command .. '{' .. label .. '}')})
            elseif #cite.prefix > 0 then
              add_ref_prefix(ref, type, cite.prefix)
            elseif cite.mode ~= pandoc.SuppressAuthor then
              
              -- some special handling to detect chapters and use
              -- an alternate prefix lookup
              local prefixType = type
              local chapters = crossrefOption("chapters", false)
              if chapters and entry then
                if resolve and type == "sec" and isChapterRef(entry.order.section) then
                  if entry.appendix then
                    prefixType = "apx"
                  else
                    prefixType = "ch"
                  end
                end
              end
              if resolve or type ~= "sec" then
                local prefix = refPrefix(prefixType, upper)
                if #prefix > 0 then
                  add_ref_prefix(ref, type, prefix)
                end
              end
            end
  
            -- for latex inject a \ref, otherwise format manually
            if _quarto.format.isLatexOutput() then
              -- check for custom ref command here, but don't combine the conditional above
              -- so we don't get the fallthrough else clause in latex when custom ref commands
              -- are in play
              if category == nil or category.custom_ref_command == nil then
                ref:extend(pandoc.List({pandoc.RawInline('latex', '\\ref{' .. label .. '}')}))
              end
            elseif _quarto.format.isAsciiDocOutput() then
              ref = pandoc.List({pandoc.RawInline('asciidoc', '<<' .. label .. '>>')})
            elseif _quarto.format.isTypstOutput() then
              ref:insert(1, pandoc.RawInline('typst', '#ref(<' .. label .. '>, supplement: ['))
              ref:insert(pandoc.RawInline('typst', '])'))
            else
              if not resolve then
                local refClasses = pandoc.List({"quarto-unresolved-ref"})
                if #cite.prefix > 0 or cite.mode == pandoc.SuppressAuthor then
                  refClasses:insert("ref-noprefix")
                end
                local refSpan = pandoc.Span(
                  stringToInlines(label), 
                  pandoc.Attr("", refClasses)
                )
                ref:insert(refSpan)
              elseif entry ~= nil then
                if entry.parent ~= nil then
                  local parentType = refType(entry.parent)
                  local parent = crossref.index.entries[entry.parent]
                  ref:extend(refNumberOption(parentType,parent))
                  ref:extend({pandoc.Space(), pandoc.Str("(")})
                  ref:extend(subrefNumber(entry.order))
                  ref:extend({pandoc.Str(")")})
                else
                  ref:extend(refNumberOption(type, entry))
                end
              end
  
                -- link if requested
              if (refHyperlink()) then
                ref = {pandoc.Link(ref, "#" .. label, "", pandoc.Attr("", {'quarto-xref'}))}
              end
            end
  
            -- add the ref
            refs:extend(ref)
  
          -- no entry for this reference, if it has a valid ref prefix
          -- then yield error text
          elseif tcontains(refTypes, type) then
            warn("Unable to resolve crossref @" .. label)
            local err = pandoc.Strong({ pandoc.Str("?@" .. label) })
            refs:extend({err})
          end
        end
      end

      -- swap citeEl for refs if we found any
      if #refs > 0 then
        return refs
      else
        return citeEl
      end


    end
  }
end


-- we're removing the dashes from this uuid because
-- it makes it easier to handling it in lua patterns

local quarto_auto_label_safe_latex_uuid = "539a35d47e664c97a50115a146a7f1bd"
function autoRefLabel(refType)
  local index = 1
  while true do
    local label = refType .. "-" .. quarto_auto_label_safe_latex_uuid .. "-" ..tostring(index)
    if not crossref.autolabels:includes(label) then
      crossref.autolabels:insert(label)
      return label
    else
      index = index + 1
    end
  end
end

function autoSubrefLabel(parentId)
  local index = 1
  while true do
    local label = parentId .. "-" .. tostring(index)
    if not crossref.autolabels:includes(label) then
      crossref.autolabels:insert(label)
      return label
    else
      index = index + 1
    end
  end
end

function refLabel(type, inline)
  if inline.text then
    return string.match(inline.text, "^" .. refLabelPattern(type) .. "$")
  else
    return nil
  end
end

function extractRefLabel(type, text)
  return string.match(text, "^(.*)" .. refLabelPattern(type) .. "$")
end

function refLabelPattern(type)
  return "{#(" .. type .. "%-[^ }]+)}"
end

function is_valid_ref_type(type) 
  return tcontains(valid_ref_types(), type)
end

function valid_ref_types()
  local types = tkeys(theorem_types)
  for k, _ in pairs(crossref.categories.by_ref_type) do
    table.insert(types, k)
    -- if v.type ~= nil and not tcontains(types, v.type) then
    --   table.insert(types, v.type)
    -- end
  end
  -- table.insert(types, "fig")
  -- table.insert(types, "tbl")
  -- table.insert(types, "lst")
  table.insert(types, "eq")
  table.insert(types, "sec")
  return types
end

-- meta.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- inject metadata
function crossrefMetaInject()
  return {
    Meta = function(meta)
      local function as_latex(inlines)
        return trim(pandoc.write(pandoc.Pandoc(quarto.utils.as_blocks(inlines)), "latex"))
      end
      metaInjectLatex(meta, function(inject)
        
        inject(usePackage("caption"))

        inject(
          "\\AtBeginDocument{%\n" ..
          maybeRenewCommand("contentsname", param("toc-title-document", "Table of contents")) ..
          maybeRenewCommand("listfigurename", listOfTitle("lof", "List of Figures")) ..
          maybeRenewCommand("listtablename", listOfTitle("lot", "List of Tables")) ..
          maybeRenewCommand("figurename", as_latex(title("fig", "Figure"))) ..
          maybeRenewCommand("tablename", as_latex(title("tbl", "Table"))) ..
          "}\n"
        )
      
        if param("listings", false) then
          inject(
            "\\newcommand*\\listoflistings\\lstlistoflistings\n" ..
            "\\AtBeginDocument{%\n" ..
            "\\renewcommand*\\lstlistlistingname{" .. listOfTitle("lol", "List of Listings") .. "}\n" ..
            "}\n"
          )
        else
          inject(
            usePackage("float") .. "\n" ..
            "\\floatstyle{ruled}\n" ..
            "\\@ifundefined{c@chapter}{\\newfloat{codelisting}{h}{lop}}{\\newfloat{codelisting}{h}{lop}[chapter]}\n" ..
            "\\floatname{codelisting}{" .. as_latex(title("lst", "Listing")) .. "}\n"
          )

          inject(
            "\\newcommand*\\listoflistings{\\listof{codelisting}{" .. listOfTitle("lol", "List of Listings") .. "}}\n"
          )
        end

        -- title-delim
        if crossrefOption("title-delim") ~= nil then
          local titleDelim = pandoc.utils.stringify(crossrefOption("title-delim"))
          if titleDelim == ":" or titleDelim == "colon" then
            inject("\\captionsetup{labelsep=colon}\n")
          elseif titleDelim == "." or titleDelim == "period" then
            inject("\\captionsetup{labelsep=period}\n")
          elseif titleDelim == " " or titleDelim == "space" then
            inject("\\captionsetup{labelsep=space}\n")
          elseif titleDelim == "quad" then
            inject("\\captionsetup{labelsep=quad}\n")
          elseif titleDelim == "none" or titleDelim == "" then
            inject("\\captionsetup{labelsep=none}\n")
          else
            warn("\nIgnoring invalid value for 'title-delim' option in PDF: " .. titleDelim .. "." ..
                 "\nThe valid values in the caption LaTeX package are:" ..
                 "\n'', 'none', ':', 'colon', '.', 'period', ' ', 'space', and 'quad'")
          end
        end
        
        local theoremIncludes = theoremLatexIncludes()
        if theoremIncludes then
          inject(theoremIncludes)
        end
      end)
      
      return meta
    end
  }
end

function maybeRenewCommand(command, arg) 
  local commandWithArg = command .. "{" .. arg .. "}"
  return "\\ifdefined\\" .. command .. "\n  " .. "\\renewcommand*\\" .. commandWithArg .. "\n\\else\n  " .. "\\newcommand\\" .. commandWithArg .. "\n\\fi\n"
end


-- latex 'listof' title for type
function listOfTitle(type, default)
  local title = crossrefOption(type .. "-title")
  if title then
    return pandoc.utils.stringify(title)
  else
    return param("crossref-" .. type .. "-title", default)
  end
end
-- format.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

function title(type, default)
  default = param("crossref-" .. type .. "-title", default)
  return crossrefOption(type .. "-title", stringToInlines(default))
end

function envTitle(type, default)
  return param("environment-" .. type .. "-title", default)
end

function titleString(type, default)
  return pandoc.utils.stringify(title(type, default))
end

function titlePrefix(ref_type, default, order, with_title_delimiter)
  if with_title_delimiter == nil then
    with_title_delimiter = true
  end

  local prefix = title(ref_type, default)
  local category = crossref.categories.by_ref_type[ref_type]
  if category == nil or category.space_before_numbering ~= false then
    table.insert(prefix, nbspString())
  end
  tappend(prefix, numberOption(ref_type, order))
  if with_title_delimiter then
    tappend(prefix, titleDelim())
    table.insert(prefix, pandoc.Space())
  end
  return prefix
end

function titleDelim()
  return crossrefOption("title-delim", stringToInlines(":"))
end

function captionSubfig()
  return crossrefOption("caption-subfig", true)
end

function captionCollectedDelim()
  return crossrefOption("caption-collected-delim", stringToInlines(",\u{a0}"))
end

function captionCollectedLabelSep()
  return crossrefOption("caption-collected-label-sep", stringToInlines("\u{a0}—\u{a0}"))
end

function subrefNumber(order)
  return numberOption("subref", order,  {pandoc.Str("alpha"),pandoc.Space(),pandoc.Str("a")})
end

function prependSubrefNumber(captionContent, order)
  if not _quarto.format.isLatexOutput() and not _quarto.format.isAsciiDocOutput() then
    if #inlinesToString(captionContent) > 0 then
      tprepend(captionContent, { pandoc.Space() })
    end
    tprepend(captionContent, { pandoc.Str(")") })
    tprepend(captionContent, subrefNumber(order))
    captionContent:insert(1, pandoc.Str("("))
  end
end

function refPrefix(type, upper)
  local opt = type .. "-prefix"
  local default = param("crossref-" .. type .. "-prefix")
  if default == nil then
    default = crossref.categories.by_ref_type[type]
    if default ~= nil then
      default = default.prefix
    end
  end
  if default == nil then
    default = type .. "."
  end
  default = stringToInlines(default)
  local prefix = crossrefOption(opt, default)
  if upper then
    local el = pandoc.Plain(prefix)
    local firstStr = true
    el = _quarto.ast.walk(el, {
      Str = function(str)
        if firstStr then
          local strText = pandoc.text.upper(pandoc.text.sub(str.text, 1, 1)) .. pandoc.text.sub(str.text, 2, -1)
          str = pandoc.Str(strText)
          firstStr = false
        end
        return str
      end
    })
    prefix = el.content
  end
  return prefix
end

function refDelim()
  return crossrefOption("ref-delim", stringToInlines(","))
end

function refHyperlink()
  return crossrefOption("ref-hyperlink", true)
end

function refNumberOption(type, entry)

  -- for sections just return the section levels
  if type == "sec" then
    local num = nil
    if entry.appendix then
      num = string.char(64 + entry.order.section[1] - crossref.startAppendix + 1)
    elseif crossrefOption("chapters", false) then
      num = tostring(entry.order.section[1])
    end
    return stringToInlines(sectionNumber(entry.order.section, nil, num))
  end

  -- handle other ref types
  return formatNumberOption(type, entry.order)
end


function numberOption(type, order, default)
  
  -- for sections, just return the section levels (we don't currently
  -- support custom numbering for sections since pandoc is often the
  -- one doing the numbering)
  if type == "sec" then
    return stringToInlines(sectionNumber(order.section))
  end

  -- format
  return formatNumberOption(type, order, default)
end

function formatNumberOption(type, order, default)

  -- alias num and section (set section to nil if we aren't using chapters)
  local num = order.order
  local section = order.section
  if not crossrefOption("chapters", false) then
    section = nil
  elseif section ~= nil and section[1] == 0 then
    section = nil
  elseif crossref.maxHeading ~= 1 then
    section = nil
  end
  
  -- return a pandoc.Str w/ chapter prefix (if any)
  local function resolve(num)
    if section then
      local sectionIndex = section[1]
      if crossrefOption("chapters-alpha", false) then
        sectionIndex = string.char(64 + sectionIndex)
      elseif crossref.startAppendix ~= nil and sectionIndex >= crossref.startAppendix then
        sectionIndex = string.char(64 + sectionIndex - crossref.startAppendix + 1)
      else
        sectionIndex = tostring(sectionIndex)
      end
      num = sectionIndex .. "." .. num
    end
    return pandoc.Inlines({ pandoc.Str(num) })
  end
  
  -- Compute option name and default value
  local opt = type .. "-labels"
  if default == nil then
    default = stringToInlines("arabic")
  end

  -- See if there a global label option, if so, use that
  -- if the type specific label isn't specified
  local labelOpt = crossrefOption("labels", default);
  
  -- determine the style
  local styleRaw = crossrefOption(opt, labelOpt)


  local numberStyle = pandoc.utils.stringify(styleRaw)

  -- process the style
  if (numberStyle == "arabic") then
    return resolve(tostring(num))
  elseif (string.match(numberStyle, "^alpha ")) then
    -- permits the user to include the character that they'd like
    -- to start the numbering with (e.g. alpha a vs. alpha A)
    local s = split(numberStyle, " ") 
    local startIndexChar = s[2]
    if (startIndexChar == nil or startIndexChar == " ") then
      startIndexChar = "a"
    end
    -- local startIndexChar = string.sub(numberStyle, -1)
    -- if (startIndexChar == " ") then
    --   startIndexChar = "a"
    -- end
    -- print(numberStyle)
    local startIndex = utf8.codepoint(startIndexChar)
    return resolve(utf8.char(startIndex + num - 1))
  elseif (string.match(numberStyle, "^roman")) then
    -- permits the user to express `roman` or `roman i` or `roman I` to
    -- use lower / uppper case roman numerals
    local lower = false
    if (string.sub(numberStyle, -#"i") == "i") then
      lower = true
    end
    return resolve(toRoman(num, lower))
  else
    -- otherwise treat the value as a list of values to use
    -- to display the numbers
    local entryCount = #styleRaw

    -- select an index based upon the num, wrapping it around
    local entryIndex = (num - 1) % entryCount + 1
    local option = styleRaw[entryIndex]:clone()
    if section then
      tprepend(option, { pandoc.Str(tostring(section[1]) .. ".") })
    end
    return pandoc.Inlines({ option })
  end

end


function sectionNumber(section, maxLevel, num)

  if num == nil then
    num = ""
    if crossref.maxHeading == 1 then
      num = formatChapterIndex(section[1])
    end
  end

  local endIndex = #section
  if maxLevel then
    endIndex = maxLevel
  end
  local lastIndex = 1
  for i=endIndex,2,-1 do
    if section[i] > 0 then
      lastIndex = i
      break
    end
  end

  for i=2,lastIndex do
    if num ~= '' then
      num = num .. "."
    end
    num = num .. tostring(section[i])
  end

  return num
end

function isChapterRef(section)
  for i=2,#section do
    if section[i] > 0 then
      return false
    end
  end
  return true
end

function formatChapterIndex(index)
  local fileMetadata = currentFileMetadataState()
  if fileMetadata.appendix then
    return string.char(64 + fileMetadata.file.bookItemNumber)
  elseif crossrefOption("chapters-alpha", false) then
    return string.char(64 + index)
  else
    return tostring(index)
  end
end

function toRoman(num, lower)
  local roman = pandoc.utils.to_roman_numeral(num)
  if lower then
    lower = ''
    for i = 1, #roman do
      lower = lower .. string.char(utf8.codepoint(string.sub(roman,i,i)) + 32)
    end
    return lower
  else
    return roman
  end
end
-- options.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- initialize options from 'crossref' metadata value
function init_crossref_options(meta)
  crossref.options = readFilterOptions(meta, "crossref")

  -- automatically set maxHeading to 1 if we are in chapters mode, otherwise set to max (7)
  if crossrefOption("chapters", false) then
    crossref.maxHeading = 1
  else
    crossref.maxHeading = 7
  end
end

-- get option value
function crossrefOption(name, default)
  return readOption(crossref.options, name, default)
end



-- bibliography-formats.lua
-- Copyright (C) 2020-2022 Posit Software, PBC


function bibliography_formats()
  return {
    Pandoc = function(doc)
      if _quarto.format.isBibliographyOutput() then
        doc.meta.references = pandoc.utils.references(doc)
        doc.meta.bibliography = nil
        return doc
      end
    end
  }
end
-- book-links.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

function index_book_file_targets() 
    if not param("single-file-book", false) then
      return {} 
    else 
      return {
        Header = function(el)
          if el.level == 1 then 
            local file = currentFileMetadataState().file
            if file ~= nil then   
              local filename = file.bookItemFile;
              if filename ~= nil and quarto_global_state.fileSectionIds[filename] == nil then
                quarto_global_state.fileSectionIds[filename] = el.identifier
              end
            end
          end
        end
      }
  end
end

function resolve_book_file_targets() 
  if not param("single-file-book", false) then
    return {} 
  else
    return {
      Link = function(el)
        local linkTarget = el.target
        -- if this is a local path
        if isRelativeRef(linkTarget) then
          local file = currentFileMetadataState().file
  
          -- normalize the linkTarget (collapsing any '..')
          if #linkTarget > 0 then
            local fullPath = linkTarget
            if file ~= nil and file.resourceDir ~= nil then
              fullPath = pandoc.path.join({file.resourceDir, linkTarget})
            end
            linkTarget = pandoc.path.normalize(flatten(fullPath));
          end
          
          -- resolve the path
          local hashPos = string.find(linkTarget, '#')
          if hashPos ~= nil then
            -- deal with a link that includes a hash (just remove the prefix)
            local target = string.sub(linkTarget, hashPos, #linkTarget)
            el.target = target
          else
            -- Deal with bare file links
            -- escape windows paths if present
            package.config:sub(1,1)
            
            -- Paths are always using '/' separator (even on windows)
            linkTarget = linkTarget:gsub("\\", "/")
            local sectionId = quarto_global_state.fileSectionIds[linkTarget];
            if sectionId ~= nil then
              el.target = '#' .. sectionId
            end
          end
        end
        return el
      end 
    }  
  end
end

function flatten(targetPath) 
  local pathParts = pandoc.path.split(targetPath)
  local resolvedPath = pandoc.List()

  -- FIXME are we not handling "."?
  for _, part in ipairs(pathParts) do 
    if part == '..' then
      table.remove(resolvedPath)
    else
      resolvedPath:insert(part)
    end
  end
  return pandoc.path.join(resolvedPath)
end
-- book-numbering.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- For Typst books, generate a show rule that resets Quarto's custom figure
-- counters at each chapter (level-1 heading). Orange-book only resets
-- kind:image and kind:table, but Quarto uses custom kinds for figures,
-- tables, listings, callouts, custom crossref categories, and math equations.
local function typst_book_counter_reset_rule()
  if not _quarto.format.isTypstOutput() then
    return nil
  end
  if not param("single-file-book", false) then
    return nil
  end

  -- Collect all Typst figure kinds that need counter resets
  local kinds = pandoc.List({})

  for _, category in ipairs(crossref.categories.all) do
    if category.kind == "float" then
      -- Floats use "quarto-float-" .. ref_type (e.g., quarto-float-fig)
      kinds:insert("quarto-float-" .. category.ref_type)
    elseif category.kind == "Block" then
      -- Block kinds (callouts) use "quarto-callout-" .. name (e.g., quarto-callout-Warning)
      -- Only include callout types (they have specific ref_types)
      local callout_ref_types = {nte=true, wrn=true, cau=true, tip=true, imp=true}
      if callout_ref_types[category.ref_type] then
        kinds:insert("quarto-callout-" .. category.name)
      end
    end
  end

  if #kinds == 0 then
    return nil
  end

  -- Build the show rule that resets all counters at chapter boundaries
  local lines = pandoc.List({
    "// Reset Quarto's custom figure counters at each chapter (level-1 heading).",
    "// Orange-book only resets kind:image and kind:table, but Quarto uses custom kinds.",
    "// This list is generated dynamically from crossref.categories.",
    "#show heading.where(level: 1): it => {"
  })
  for _, kind in ipairs(kinds) do
    lines:insert('  counter(figure.where(kind: "' .. kind .. '")).update(0)')
  end
  -- Reset math equation counter at chapter boundaries
  lines:insert('  counter(math.equation).update(0)')
  lines:insert("  it")
  lines:insert("}")

  return table.concat(lines, "\n")
end

function book_numbering()
  return {
    Meta = function(meta)
      -- Inject Typst counter reset show rule into include-before
      local reset_rule = typst_book_counter_reset_rule()
      if reset_rule then
        ensureIncludes(meta, kIncludeBefore)
        meta[kIncludeBefore]:insert(pandoc.Blocks({
          pandoc.RawBlock("typst", reset_rule)
        }))
      end
      return meta
    end,

    Header = function(el)
      local file = currentFileMetadataState().file
      if file ~= nil then
        local bookItemType = file.bookItemType
        local bookItemDepth = file.bookItemDepth
        if bookItemType ~= nil then
          -- if we are in an unnumbered chapter then add unnumbered class
          if bookItemType == "chapter" and file.bookItemNumber == nil then
            el.attr.classes:insert('unnumbered')
          end

          -- handle latex "part" and "appendix" headers
          if el.level == 1 and _quarto.format.isLatexOutput() then
            if bookItemType == "part" then
              local partPara = pandoc.Para({
                pandoc.RawInline('latex', '\\part{')
              })
              tappend(partPara.content, el.content)
              partPara.content:insert( pandoc.RawInline('latex', '}'))
              return partPara
            elseif bookItemType == "appendix" then
              local appendixPara = pandoc.Para({
                pandoc.RawInline('latex', '\\cleardoublepage\n\\phantomsection\n\\addcontentsline{toc}{part}{')
              })
              tappend(appendixPara.content, el.content)
              appendixPara.content:insert(pandoc.RawInline('latex', '}\n\\appendix'))
              return appendixPara
            elseif bookItemType == "chapter" and bookItemDepth == 0 then
              quarto_global_state.usingBookmark = true
              local bookmarkReset = pandoc.Div({
                pandoc.RawInline('latex', '\\bookmarksetup{startatroot}\n'),
                el
              })
              return bookmarkReset
            end
          end

          -- Typst part/appendix handling is delegated to book extensions
          -- (each Typst book package has different syntax for parts and appendices)

          -- mark appendix chapters for epub
          if el.level == 1 and _quarto.format.isEpubOutput() then
            if file.appendix == true and bookItemType == "chapter" then
              el.attr.attributes["epub:type"] = "appendix"
            end
          end

          -- part cover pages have unnumbered headings
          if (bookItemType == "part") then
            el.attr.classes:insert("unnumbered")
          end

          -- return potentially modified heading el
          return el
        end
      end
    end
  }
end
-- code.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

local constants = require("modules/constants")


local hasAnnotations = false

function isAnnotationCell(el) 
  return el and is_regular_node(el, "Div") and el.attr.classes:includes(constants.kCellAnnotationClass)
end
-- annotations appear at the end of the line and are of the form
-- # <1> 
-- where they start with a comment character valid for that code cell
-- and they contain a number which is the annotation number in the
-- OL that will appear after the annotation


-- This provider will yield functions for a particular language that 
-- can be used to resolve annotation numbers and strip them from source 
-- code
local function annoteProvider(lang) 
  local commentChars = constants.kLangCommentChars[lang] or constants.kDefaultCodeAnnotationComment
  if commentChars ~= nil then

    local startComment = patternEscape(commentChars[1])
    local matchExpr = '.*' .. startComment .. '%s*<([0-9]+)>%s*'
    local stripPrefix = '%s*' .. startComment .. '%s*<'
    local stripSuffix = '>%s*'
    if #commentChars == 2 then
      local endComment = patternEscape(commentChars[2])
      matchExpr = matchExpr .. endComment .. '%s*'
      stripSuffix = stripSuffix .. endComment .. '%s*'
    end
    matchExpr = matchExpr .. '$'
    stripSuffix = stripSuffix .. '$'

    local expression = {
        match = matchExpr,
        strip = {
          prefix = stripPrefix,
          suffix = stripSuffix
        },
      }

    return {
      annotationNumber = function(line) 
          local _, _, annoteNumber = string.find(line, expression.match)
          if annoteNumber ~= nil then
            return tonumber(annoteNumber)
          else
            return nil
          end
      end,
      stripAnnotation = function(line, annoteId) 
        return line:gsub(expression.strip.prefix .. annoteId .. expression.strip.suffix, "")
      end,
      replaceAnnotation = function(line, annoteId, replacement) 
        return line:gsub(expression.strip.prefix .. annoteId .. expression.strip.suffix, replacement)
      end,
      createComment = function(value) 
        if #commentChars == 0 then
          return value
        else if #commentChars == 1 then
          return commentChars[1] .. ' ' .. value
        else
          return commentChars[1] .. ' '.. value .. ' ' .. commentChars[2]
        end
      end

      end
    }
  else
    return nil
  end
end


local function toAnnoteId(number) 
  return 'annote-' .. tostring(number)
end

local function latexListPlaceholder(number)
  return '5CB6E08D-list-annote-' .. number 
end

local function toLines(s)
  if s:sub(-1)~="\n" then s=s.."\n" end
  return s:gmatch("(.-)\n")
end

-- Finds annotations in a code cell and returns 
-- the annotations as well as a code cell that
-- removes the annotations
local function resolveCellAnnotes(codeBlockEl, processAnnotation) 

  -- The start line, this may be shifted for cases like 
  -- fenced code blocks, which will have additional code injected
  -- and so require an adjusted start line
  local defaultStartLine = 1 

  -- collect any annotations on this code cell
  local lang = codeBlockEl.attr.classes[1] 
  -- handle fenced-echo block which will have no language
  if lang == "cell-code" then 
    _, _, matchedLang = string.find(codeBlockEl.text, "^`+%{%{([^%}]*)%}%}")
    lang = matchedLang or lang
  elseif lang ~= nil and startsWith(lang, '{{') then
    _, _, matchedLang = string.find(lang, "{{+(.-)}}+")
    if matchedLang then
      lang = matchedLang
      defaultStartLine = defaultStartLine + 1
    end
  end



  local annotationProvider = annoteProvider(lang)
  if annotationProvider ~= nil then
    local annotations = {}
    local code = codeBlockEl.text
    
    local outputs = pandoc.List({})
    local i = 1
    local offset = codeBlockEl.attr.attributes['startFrom'] or defaultStartLine
    for line in toLines(code) do
  
      -- Look and annotation
      local annoteNumber = annotationProvider.annotationNumber(line)
      if annoteNumber then
        -- Capture the annotation number and strip it
        local annoteId = toAnnoteId(annoteNumber)
        local lineNumbers = annotations[annoteId]
        if lineNumbers == nil then
          lineNumbers = pandoc.List({})
        end
        -- line numbers stored for targetting annotations line needs to take into account possible startFrom attribute
        lineNumbers:insert(offset - 1 + i)
        annotations[annoteId] = lineNumbers
        outputs:insert(processAnnotation(line, annoteNumber, annotationProvider))
      else
        outputs:insert(line)
      end
      i = i + 1
    end    

    -- if we capture annotations, then replace the code source
    -- code, stripping annotation comments
    if annotations and next(annotations) ~= nil then
      local outputText = ""
      for i, output in ipairs(outputs) do
        outputText = outputText .. output
        if i < #outputs then
          outputText = outputText .. '\n'
        end
      end
      codeBlockEl.text = outputText
      hasAnnotations = true
    end
    return codeBlockEl, annotations 
  elseif lang then
    return codeBlockEl, {}
  end
  
end

local function lineNumberMeta(list) 

  -- accumulates the output string
  local val = ''
  local addLines = function(lines) 
    if val == '' then
      val = lines
    else 
      val = val .. ',' .. lines
    end
  end

  -- writes out either an individual number of a range
  -- of numbers (from pending to current)
  local pending = nil
  local current = nil
  local valuesWritten = 0;
  local writePending = function()
    if pending == current then
      addLines(tostring(current))
      pending = nil
      current = nil
      valuesWritten = valuesWritten + 1 -- one for the pending line number
    else
      addLines(tostring(pending) .. '-' .. tostring(current))
      pending = nil
      current = nil
      valuesWritten = valuesWritten + 2 -- one for pending, one for current
    end
  end

  -- go through the line numbers and collapse sequences of numbers
  -- into a line number ranges when possible
  local lineNoStr = ""
  for _i, v in ipairs(list) do
    if lineNoStr == "" then
      lineNoStr = v
    else 
      lineNoStr = lineNoStr .. ',' .. v
    end

    if pending == nil then
      pending = v
      current = v
    else
      if v == current + 1 then
        current = v
      else 
        writePending()
        pending = v
        current = v
      end
    end
  end
  if pending ~= nil then
    writePending()
  end

  return {
    text = val,
    count = valuesWritten,
    lineNumbers = lineNoStr
  }
end

function processLaTeXAnnotation(line, annoteNumber, annotationProvider)
  -- we specially handle LaTeX output in coordination with the post processor
  -- which will replace any of these tokens as appropriate.   
  local hasHighlighting = param('text-highlighting', false)
  if param(constants.kCodeAnnotationsParam) == constants.kCodeAnnotationStyleNone then
    local replaced = annotationProvider.stripAnnotation(line, annoteNumber) 
    return replaced
  else
    if hasHighlighting then
      -- highlighting is enabled, allow the comment through
      local placeholderComment = annotationProvider.createComment("<" .. tostring(annoteNumber) .. ">")
      local replaced = annotationProvider.replaceAnnotation(line, annoteNumber, percentEscape(" " .. placeholderComment)) 
      return replaced
    else
      -- no highlighting enabled, ensure we use a standard comment character
      local placeholderComment = "%% (" .. tostring(annoteNumber) .. ")"
      local replaced = annotationProvider.replaceAnnotation(line, annoteNumber, placeholderComment) 
      return replaced
    end
  end
end

function processAsciidocAnnotation(line, annoteNumber, annotationProvider)
  if param(constants.kCodeAnnotationsParam) == constants.kCodeAnnotationStyleNone then
    local replaced = annotationProvider.replaceAnnotation(line, annoteNumber, '') 
    return replaced
  else
    local replaced = annotationProvider.replaceAnnotation(line, annoteNumber, " <" .. tostring(annoteNumber) .. ">") 
    return replaced
  end
end

function processAnnotation(line, annoteNumber, annotationProvider)
    -- For all other formats, just strip the annotation- the definition list is converted
    -- to be based upon line numbers. 
        local stripped = annotationProvider.stripAnnotation(line, annoteNumber)
    return stripped
end

function code_meta()
  return {
    Meta = function(meta)
      if _quarto.format.isLatexOutput() and hasAnnotations and param(constants.kCodeAnnotationsParam) ~= constants.kCodeAnnotationStyleNone then
        -- ensure we have tikx for making the circles
        quarto.doc.use_latex_package("tikz");
        quarto.doc.include_text('in-header', [[
        \newcommand*\circled[1]{\tikz[baseline=(char.base)]{
          \node[shape=circle,draw,inner sep=1pt] (char) {{\scriptsize#1}};}}  
                  ]]);  
      end
    end,

  }
end

-- The actual filter that will look for a code cell and then
-- find its annotations, then process the subsequent OL
function code_annotations()
  -- the localized strings
  local language = param("language", nil)

  -- an id counter to provide nice numeric ids to cell
  local idCounter = 1

  -- the user request code annotations value
  local codeAnnotations = param(constants.kCodeAnnotationsParam)

  local requireNonIncremental = PANDOC_WRITER_OPTIONS[constants.kIncremental] and (
    codeAnnotations == constants.kCodeAnnotationStyleSelect or codeAnnotations == constants.kCodeAnnotationStyleHover
  )

  -- walk the blocks and look for annotated code
  -- process the list top down so that we see the outer
  -- code divs first
  local code_filter = {
    traverse = 'topdown',
    Blocks = function(blocks) 

      -- if code annotations is false, then shut it down
      if codeAnnotations ~= false then

        local outputs = pandoc.Blocks{}

        -- annotations[annotation-number] = {list of line numbers}
        local pendingAnnotations = nil
        local pendingCellId = nil
        local pendingCodeCell = nil

        local clearPending = function()          
          pendingAnnotations = nil
          pendingCellId = nil
          pendingCodeCell = nil
        end
   
        local outputBlock = function(block)
          outputs:insert(block)
        end
        
        local flushPending = function()
          if pendingCodeCell then
            outputBlock(pendingCodeCell)
          end
          clearPending()
        end

        local outputBlockClearPending = function(block)
          flushPending()
          outputBlock(block)
        end

        local allOutputs = function()
          return outputs
        end

        local resolveCellId = function(identifier) 
          if identifier ~= nil and identifier ~= '' then
            return identifier
          else
            local cellId = 'annotated-cell-' .. tostring(idCounter)
            idCounter = idCounter + 1
            return cellId
          end
        end

        local processCodeCell = function(el, identifier)

          -- select the process for this format's annotations
          local annotationProcessor = processAnnotation
          if _quarto.format.isLatexOutput() then
            annotationProcessor = processLaTeXAnnotation
          elseif _quarto.format.isAsciiDocOutput() then
            annotationProcessor = processAsciidocAnnotation
          end

          -- resolve annotations
          local resolvedCodeBlock, annotations = resolveCellAnnotes(el, annotationProcessor)
          if annotations and next(annotations) ~= nil then
            -- store the annotations and  cell info
            pendingAnnotations = annotations
            pendingCellId = identifier
            
            -- decorate the cell and return it
            if codeAnnotations ~= constants.kCodeAnnotationStyleNone then
              resolvedCodeBlock.attr.classes:insert(constants.kDataCodeAnnonationClz);
            end
            return resolvedCodeBlock
          else
            return nil
          end
        end

        for i, block in ipairs(blocks) do
          local found = is_regular_node(block, "Div") and block.attr.classes:find('cell')
          if is_custom_node(block) then
            local custom = _quarto.ast.resolve_custom_data(block)
            if custom then
              found = found or (custom.classes or pandoc.List({})):find('cell')
            end
          end
          if found then
            -- Process executable code blocks 
            -- In the case of executable code blocks, we actually want
            -- to shift the OL up above the output, so we hang onto this outer
            -- cell so we can move the OL up into it if there are annotations
            local processedAnnotation = false
            local resolvedBlock = _quarto.ast.walk(block, {
              CodeBlock = function(el)
                if el.attr.classes:find('cell-code') then
                  local cellId = resolveCellId(el.attr.identifier)
                  local codeCell = processCodeCell(el, cellId)
                  if codeCell then
                    processedAnnotation = true
                    if codeAnnotations ~= constants.kCodeAnnotationStyleNone then
                      codeCell.attr.identifier = cellId;
                    end
                  end
                  return codeCell
                end
              end
            })
            if processedAnnotation then
              -- we found annotations, so hand onto this cell
              pendingCodeCell = resolvedBlock
            else
              -- no annotations, just output it
              outputBlock(resolvedBlock)
            end

          elseif block.t == "Div" then
            local isDecoratedCodeBlock = is_custom_node(block, "DecoratedCodeBlock")
            if isDecoratedCodeBlock then
              -- If there is a pending code cell and we get here, just
              -- output the pending code cell and continue
              flushPending()

              if #block.content == 1 and #block.content[1].content == 1 then
                -- Find the code block and process that
                local codeblock = block.content[1].content[1]
                
                local cellId = resolveCellId(codeblock.attr.identifier)
                local codeCell = processCodeCell(codeblock, cellId)
                if codeCell then
                  if codeAnnotations ~= constants.kCodeAnnotationStyleNone then
                    codeCell.attr.identifier = cellId;
                  end
                  block.content[1].content[1] = codeCell
                  outputBlock(block)
                else
                  outputBlockClearPending(block)
                end
              else
                outputBlockClearPending(block)
              end
            else
              outputBlockClearPending(block)
            end          
          elseif block.t == 'CodeBlock'  then
            -- don't process code cell output here - we'll get it above
            -- This processes non-executable code blocks
            if not block.attr.classes:find('cell-code') then

              -- If there is a pending code cell and we get here, just
              -- output the pending code cell and continue
              flushPending()

              local cellId = resolveCellId(block.attr.identifier)
              local codeCell = processCodeCell(block, cellId)
              if codeCell then
                if codeAnnotations ~= constants.kCodeAnnotationStyleNone then
                  codeCell.attr.identifier = cellId;
                end
                outputBlock(codeCell)
              else
                outputBlockClearPending(block)
              end
            else
              outputBlockClearPending(block)
            end
          elseif block.t == 'OrderedList' and pendingAnnotations ~= nil and next(pendingAnnotations) ~= nil then
            -- There are pending annotations, which means this OL is immediately after
            -- a code cell with annotations. Use to emit a DL describing the code
            local items = pandoc.List()
            for i, v in ipairs(block.content) do
              -- find the annotation for this OL
              local annotationNumber = block.start + i - 1

              local annoteId = toAnnoteId(annotationNumber)
              local annotation = pendingAnnotations[annoteId]
              if annotation then

                local lineNumMeta = lineNumberMeta(annotation)

                -- compute the term for the DT
                local term = ""
                if _quarto.format.isLatexOutput() then
                  term = latexListPlaceholder(annotationNumber)
                elseif _quarto.format.isAsciiDocOutput() then
                  term = "<" .. tostring(annotationNumber) .. ">"
                else
                  if lineNumMeta.count == 1 then
                    term = language[constants.kCodeLine] .. " " .. lineNumMeta.text;
                  else
                    term = language[constants.kCodeLines] .. " " .. lineNumMeta.text;
                  end
                end

                -- compute the definition for the DD
                local definitionContent = v[1].content 
                local annotationToken = tostring(annotationNumber);

                -- Only output span for certain formats (HTML)
                -- for markdown / gfm we should drop the spans
                local definition = nil
                if _quarto.format.isHtmlOutput() then
                  -- use an attribute list since it then guarantees that the
                  -- order of the attributes is consistent from run to run
                  local attribs = pandoc.AttributeList {
                    {constants.kDataCodeCellTarget, pendingCellId},
                    {constants.kDataCodeCellLines, lineNumMeta.lineNumbers},
                    {constants.kDataCodeCellAnnotation, annotationToken}
                  }
                  definition = pandoc.Span(definitionContent, pandoc.Attr(attribs))
                else 
                  definition = pandoc.Plain(definitionContent)
                end

                -- find the lines that annotate this and convert to a DL
                items:insert({
                  term,
                  definition})
              else
                -- there was an OL item without a corresponding annotation
                warn("List item " .. tostring(i) .. " has no corresponding annotation in the code cell\n(" .. pandoc.utils.stringify(v) ..  ")")
              end
            end

            -- add the definition list
            local dl
            if _quarto.format.isAsciiDocOutput() then
              local formatted = pandoc.List()
              for _,v in ipairs(items) do
                local annotationMarker = v[1] .. ' '
                local definition = v[2]
                tprepend(definition.content, {pandoc.RawInline('asciidoc', annotationMarker)})
                formatted:insert(definition)
              end
              dl = pandoc.Div(formatted)
            else
              dl = pandoc.DefinitionList(items)
            end

            -- if there is a pending code cell, then insert into that and add it
            if codeAnnotations ~= constants.kCodeAnnotationStyleNone then
              if pendingCodeCell ~= nil then
                -- wrap the definition list in a cell
                local dlDiv = pandoc.Div({dl}, pandoc.Attr("", {constants.kCellAnnotationClass, requireNonIncremental and constants.kNonIncremental or nil }))
                if is_custom_node(pendingCodeCell) then
                  local custom = _quarto.ast.resolve_custom_data(pendingCodeCell) or pandoc.Div({}) -- won't happen but the Lua analyzer doesn't know it
                  custom.content:insert(2, dlDiv)
                else
                  pendingCodeCell.content:insert(2, dlDiv)
                end
                flushPending()
              else
                if requireNonIncremental then
                  -- wrap in Non Incremental Div to prevent automatique 
                  outputBlockClearPending(pandoc.Div({dl}, pandoc.Attr("", {constants.kNonIncremental})))
                else 
                  outputBlockClearPending(dl)
                end
              end
            else
              flushPending()
            end
          else
            outputBlockClearPending(block)
          end
        end

        -- Be sure to flush any pending Code Cell (usually when only annotated cell without annotation and no other following blocks)
        flushPending()

        return allOutputs()
      end
    end
  }

  -- return code_filter
  return {
    Pandoc = function(doc)
      local codeAnnotations = param(constants.kCodeAnnotationsParam)

      -- if code annotations is false, then don't even walk it
      if codeAnnotations == false then
        return nil
      end
      
      return _quarto.ast.walk(doc, code_filter)
    end
  }
end
-- for code blocks w/ filename create an enclosing div:
-- <div class="code-with-filename">
--   <div class="code-with-filename-file">
--     <pre>filename.py</pre>
--   </div>
--   <div class="sourceCode" id="cb1" data-filename="filename.py">
--     <pre></pre>
--   </div>
-- </div>

function code_filename()
  local function codeBlockWithFilename(el, filename)
    return quarto.DecoratedCodeBlock({
      filename = filename,
      code_block = el:clone()
    })
  end

  local code_filename_filter = {
    CodeBlock = function(code)
      local filename = code.attributes["filename"]
      if filename then
        return codeBlockWithFilename(code, filename)
      end
    end,

    -- this is a weird rule, we should make sure to document it
    -- to users
    Div = function(div)
      local filename = div.attributes["filename"]
      if filename and div.content and div.content[1] and div.content[1].t == "CodeBlock" then
        local decorated_block = codeBlockWithFilename(div.content[1], filename)
        div.attributes["filename"] = nil
        div.content[1] = decorated_block
        return div
      end
    end,
    
    -- -- transform ast for 'filename'
    -- Blocks = function(blocks)
    --   local foundFilename = false
    --   local newBlocks = pandoc.List()
    --   for _,block in ipairs(blocks) do
    --     if block.attributes ~= nil and block.attributes["filename"] then
    --       local filename = block.attributes["filename"]
    --       if block.t == "CodeBlock" then
    --         foundFilename = true
    --         block.attributes["filename"] = nil
    --         local code_block = codeBlockWithFilename(block, filename)
    --         newBlocks:insert(code_block)
    --       elseif is_regular_node(block, "Div") and block.content[1].t == "CodeBlock" then
    --         foundFilename = true
    --         block.attributes["filename"] = nil
    --         block.content[1] = codeBlockWithFilename(block.content[1], filename)
    --         newBlocks:insert(block)
    --       else
    --         newBlocks:insert(block)
    --       end
    --     else
    --       newBlocks:insert(block)
    --     end
    --   end
    --   -- if we found a file name then return the modified list of blocks
    --   if foundFilename then
    --     return newBlocks
    --   else
    --     return blocks
    --   end
    -- end
  }  
  return code_filename_filter
end
-- contentsshortcode.lua
-- Copyright (C) 2020-2024 Posit Software, PBC

function contents_shortcode_filter()
  local ids_used = {}
  local divs = {}
  local spans = {}

  local function handle_inline_with_attr(el)
    if ids_used[el.attr.identifier] then
      spans[el.attr.identifier] = el
      return {}
    end

    -- remove 'cell-' from identifier, try again
    local truncated_id = el.attr.identifier:match("^cell%-(.+)$")
    if ids_used[truncated_id] then
      spans[truncated_id] = el
      -- FIXME: this is a workaround for the fact that we don't have a way to
      --        distinguish between divs that appear as the output of code cells
      --        (which have a different id creation mechanism)
      --        and "regular" divs.
      --        We need to fix https://github.com/quarto-dev/quarto-cli/issues/7062 first.
      return {}
    else
      return nil
    end
  end

  return {
    Pandoc = function(doc)
      doc = doc:walk({
        RawInline = function(el)
          if el.format ~= "quarto-internal" then
            return
          end
          if not pcall(function() 
            local data = quarto.json.decode(el.text)
            if data.type == "contents-shortcode" then
              ids_used[data.payload.id] = true
            end
          end) then
            warn("[Malformed document] Failed to decode quarto-internal JSON: " .. el.text)
          end
        end
      })
      
      doc = doc:walk({
        Div = function(el)
          if ids_used[el.attr.identifier] then
            divs[el.attr.identifier] = el
            return {}
          end
          -- remove 'cell-' from identifier, try again
          local truncated_id = el.attr.identifier:match("^cell%-(.+)$")
          if ids_used[truncated_id] then
            divs[truncated_id] = el
            -- FIXME: this is a workaround for the fact that we don't have a way to
            --        distinguish between divs that appear as the output of code cells
            --        (which have a different id creation mechanism)
            --        and "regular" divs.
            --        We need to fix https://github.com/quarto-dev/quarto-cli/issues/7062 first.
            return {}
          else
            return nil
          end
        end,
        Code = handle_inline_with_attr,
        Image = handle_inline_with_attr,
        Span = handle_inline_with_attr,
        Link = handle_inline_with_attr
      })

      local handle_block = function(el)
        if #el.content ~= 1 then
          return nil
        end
        local raw = quarto.utils.match("[1]/RawInline")(el)
        if not raw then
          return nil
        end
        local result, data = pcall(function() 
          local data = quarto.json.decode(raw.text)
          if data.type == "contents-shortcode" then
            return data.payload.id
          end
          return false
        end)
        if data == false then
          return nil
        end
        if not result or data == nil then
          warn("[Malformed document] Failed to decode quarto-internal JSON: \n" .. data .. "\n. Removing from document.")
          return {}
        end
        local div = divs[data]
        if div ~= nil then
          -- if we have a div, return it
          return div
        end
        -- if we don't have a div, try to find a span
        -- and wrap it in a div
        local span = spans[data]
        if span ~= nil then
          -- if we have a span, return it wrapped in a div
          return pandoc.Div(pandoc.Plain({span}))
        end
        quarto.log.warning(
          "[Malformed document] Found `contents` shortcode without a corresponding div with id: " .. tostring(data) .. ".\n" ..
          "This might happen because the shortcode is used in div context, while the id corresponds to a span.\n" ..
          "Removing from document.")
        return {}
      end
      doc = doc:walk({
        Para = handle_block,
        Plain = handle_block
      })
      -- replace span-context entries
      doc = doc:walk({
        RawInline = function(el)
          if el.format ~= "quarto-internal" then
            return
          end
          local result, data = pcall(function() 
            local data = quarto.json.decode(el.text)
            if data.type == "contents-shortcode" then
              return spans[data.payload.id]
            end
          end)
          if not result then
            warn("[Malformed document] Failed to decode quarto-internal JSON: \n" .. el.text .. "\n. Removing from document.")
            return {}
          end
          if data == nil then
            warn(
              "[Malformed document] Found `contents` shortcode without a corresponding span with id: " .. el.text .. ".\n" ..
              "This might happen because this shortcode is used in span context, while the id corresponds to a div.\n" ..
              "Removing from document.")
            return {}
          end
          return data
        end        
      })

      -- TODO: text-context?
      return doc
    end
  }
end
-- engine-escape.lua
-- Copyright (C) 2021-2022 Posit Software, PBC

local patterns = require("modules/patterns")

function engine_escape()
  -- Line-by-line replacement for the pattern (\n?[^`\n]+`+){({+([^<}]+)}+)}
  -- which suffers from O(n^2) backtracking on long lines without backticks.
  -- See https://github.com/quarto-dev/quarto-cli/issues/14156
  --
  -- The original pattern cannot cross newlines (due to [^`\n]+), so processing
  -- per-line is semantically equivalent and avoids catastrophic backtracking.
  local line_pattern = "([^`\n]+`+)" .. patterns.engine_escape
  local function unescape_inline_engine_codes(text)
    if not text:find("{{", 1, true) then
      return text
    end
    local result = {}
    local pos = 1
    local len = #text
    while pos <= len do
      local nl = text:find("\n", pos, true)
      local line
      if nl then
        line = text:sub(pos, nl)
        pos = nl + 1
      else
        line = text:sub(pos)
        pos = len + 1
      end
      if line:find("`", 1, true) and line:find("{{", 1, true) then
        line = line:gsub(line_pattern, "%1%2")
      end
      result[#result + 1] = line
    end
    return table.concat(result)
  end

  return {
    CodeBlock = function(el)

      -- handle code block with 'escaped' language engine
      if #el.attr.classes == 1 or #el.attr.classes == 2 and el.attr.classes[2] == 'code-annotation-code' then
        local engine, lang = el.attr.classes[1]:match(patterns.engine_escape)
        if engine then
          el.text = "```" .. engine .. "\n" .. el.text .. "\n" .. "```"
          el.attr.classes[1] = "markdown"
          return el
        end
      end

      -- handle escaped engines within a code block
      el.text = el.text:gsub("```" .. patterns.engine_escape, function(engine, lang)
        if #el.attr.classes == 0 or not isHighlightClass(el.attr.classes[1]) then
          el.attr.classes:insert(1, "markdown")
        end
        return "```" .. engine 
      end)

      -- handles escaped inline code cells within a code block
      el.text = unescape_inline_engine_codes(el.text)
      return el
    end,

    Code = function(el)
      -- don't accidentally process escaped shortcodes
      if el.text:match("^" .. patterns.shortcode) then
        return el
      end
      -- handle `{{python}} code`
      el.text = el.text:gsub("^" .. patterns.engine_escape, "%1")
      -- handles `` `{{python}} code` ``
      el.text = el.text:gsub("^(`+)" .. patterns.engine_escape, "%1%2")
      return el
    end
  }
end

-- FIXME these should be determined dynamically
local kHighlightClasses = {
  ["abc"] = true,
  ["actionscript"] = true,
  ["ada"] = true,
  ["agda"] = true,
  ["apache"] = true,
  ["asn1"] = true,
  ["asp"] = true,
  ["ats"] = true,
  ["awk"] = true,
  ["bash"] = true,
  ["bibtex"] = true,
  ["boo"] = true,
  ["c"] = true,
  ["changelog"] = true,
  ["clojure"] = true,
  ["cmake"] = true,
  ["coffee"] = true,
  ["coldfusion"] = true,
  ["comments"] = true,
  ["commonlisp"] = true,
  ["cpp"] = true,
  ["cs"] = true,
  ["css"] = true,
  ["curry"] = true,
  ["d"] = true,
  ["default"] = true,
  ["diff"] = true,
  ["djangotemplate"] = true,
  ["dockerfile"] = true,
  ["dot"] = true,
  ["doxygen"] = true,
  ["doxygenlua"] = true,
  ["dtd"] = true,
  ["eiffel"] = true,
  ["elixir"] = true,
  ["elm"] = true,
  ["email"] = true,
  ["erlang"] = true,
  ["fasm"] = true,
  ["fortranfixed"] = true,
  ["fortranfree"] = true,
  ["fsharp"] = true,
  ["gap"] = true,
  ["gcc"] = true,
  ["glsl"] = true,
  ["gnuassembler"] = true,
  ["go"] = true,
  ["graphql"] = true,
  ["groovy"] = true,
  ["hamlet"] = true,
  ["haskell"] = true,
  ["haxe"] = true,
  ["html"] = true,
  ["idris"] = true,
  ["ini"] = true,
  ["isocpp"] = true,
  ["j"] = true,
  ["java"] = true,
  ["javadoc"] = true,
  ["javascript"] = true,
  ["javascriptreact"] = true,
  ["json"] = true,
  ["jsp"] = true,
  ["julia"] = true,
  ["kotlin"] = true,
  ["latex"] = true,
  ["lex"] = true,
  ["lilypond"] = true,
  ["literatecurry"] = true,
  ["literatehaskell"] = true,
  ["llvm"] = true,
  ["lua"] = true,
  ["m4"] = true,
  ["makefile"] = true,
  ["mandoc"] = true,
  ["markdown"] = true,
  ["mathematica"] = true,
  ["matlab"] = true,
  ["maxima"] = true,
  ["mediawiki"] = true,
  ["metafont"] = true,
  ["mips"] = true,
  ["modelines"] = true,
  ["modula2"] = true,
  ["modula3"] = true,
  ["monobasic"] = true,
  ["mustache"] = true,
  ["nasm"] = true,
  ["nim"] = true,
  ["noweb"] = true,
  ["objectivec"] = true,
  ["objectivecpp"] = true,
  ["ocaml"] = true,
  ["octave"] = true,
  ["opencl"] = true,
  ["pascal"] = true,
  ["perl"] = true,
  ["php"] = true,
  ["pike"] = true,
  ["postscript"] = true,
  ["povray"] = true,
  ["powershell"] = true,
  ["prolog"] = true,
  ["protobuf"] = true,
  ["pure"] = true,
  ["purebasic"] = true,
  ["python"] = true,
  ["qml"] = true,
  ["r"] = true,
  ["raku"] = true,
  ["relaxng"] = true,
  ["relaxngcompact"] = true,
  ["rest"] = true,
  ["rhtml"] = true,
  ["roff"] = true,
  ["ruby"] = true,
  ["rust"] = true,
  ["scala"] = true,
  ["scheme"] = true,
  ["sci"] = true,
  ["sed"] = true,
  ["sgml"] = true,
  ["sml"] = true,
  ["spdxcomments"] = true,
  ["sql"] = true,
  ["sqlmysql"] = true,
  ["sqlpostgresql"] = true,
  ["stata"] = true,
  ["swift"] = true,
  ["tcl"] = true,
  ["tcsh"] = true,
  ["texinfo"] = true,
  ["toml"] = true,
  ["typescript"] = true,
  ["verilog"] = true,
  ["vhdl"] = true,
  ["xml"] = true,
  ["xorg"] = true,
  ["xslt"] = true,
  ["xul"] = true,
  ["yacc"] = true,
  ["yaml"] = true,
  ["zsh"] = true
}

function isHighlightClass(class)
  if kHighlightClasses[class] then return true else return false end
end
-- figures.lua
-- Copyright (C) 2020-2022 Posit Software, PBC


function quarto_pre_figures() 
  -- provide default fig-pos or fig-env if specified
  local function forward_pos_and_env(el)
    local figPos = param(kFigPos)
    if figPos and not el.attributes[kFigPos] then
      el.attributes[kFigPos] = figPos
    end
    -- remove fig-pos if it is false, since it
    -- signals "don't use any value"
    if el.attributes[kFigPos] == "FALSE" then
      el.attributes[kFigPos] = nil
    end
    local figEnv = param(kFigEnv)
    
    if figEnv and not el.attributes[kFigEnv] then
      el.attributes[kFigEnv] = figEnv
    end
    return el
end
  return {    
    FloatRefTarget = function(float)
      local kind = ref_type_from_float(float)
      if kind ~= "fig" then
        return
      end

      -- propagate fig-alt to Image elements for accessibility
      local altText = attribute(float, kFigAlt, nil)
      if altText ~= nil then
        if _quarto.format.isHtmlOutput() then
          -- HTML: set alt on the float itself
          float.attributes["alt"] = altText
        else
          -- LaTeX, Typst, and other formats: propagate to Image elements
          -- (enables \includegraphics[alt={...}] for LaTeX, image(alt: "...") for Typst)
          float.content = _quarto.ast.walk(float.content, {
            Image = function(image)
              image.attributes["alt"] = altText
              return image
            end
          })
        end
        float.attributes[kFigAlt] = nil
      end

      if _quarto.format.isLatexOutput() then
        return forward_pos_and_env(float)
      end

      if altText ~= nil then
        return float
      end
    end,
    Figure = function(figure)
      if _quarto.format.isLatexOutput() then
        return forward_pos_and_env(figure)
      end
    end
  }
end



-- hidden.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

local kNone = "none"
local kCode = "code"
local kWarning = "warning"
local kAll = "all"

local kKeepHidden = "keep-hidden"
local kRemoveHidden = "remove-hidden"
local kClearHiddenClasses = "clear-hidden-classes"

function hidden()

  local keepHidden = param(kKeepHidden, false)
  local removeHidden = param(kRemoveHidden, "none")
  local clearHiddenClz = param(kClearHiddenClasses, "none")

  local function stripHidden(el)
    if el.attr.classes:find("hidden") then
      return {}
    end
  end

  local function clearHiddenClasses(el) 
    local val, idx = el.attr.classes:find("hidden") 
    if idx then
      el.attr.classes:remove(idx);
      return el
    else
      return undefined
    end
  end
  
  local function isWarning(el)
    return el.attr.classes:find("cell-output-stderr")
  end

  local stripHiddenCellFilter = {
    Div = stripHidden,
    CodeBlock = stripHidden
  }

  -- Allow additional control of what to do with hidden code and warnings
  -- in the output. This allows rendering with echo/warning=false and keep-hidden=true
  -- to do some additional custom processing (for example, marking all as hidden, but
  -- but then removing the hidden elements from the output). 
  if removeHidden ~= kNone or clearHiddenClz ~= kNone then
    local function remove(thing) 
      return removeHidden == kAll or removeHidden == thing
    end

    local function clear(thing)
      return clearHiddenClz == kAll or clearHiddenClz == thing
    end

    local function clearOrRemoveEl(el) 
      if isWarning(el) then
        if remove(KWarning) then
          return stripHidden(el)
        elseif clear(kWarning) then
          return clearHiddenClasses(el)
        end
      else
        if remove(kCode) then
          return stripHidden(el)
        elseif clear(kCode) then
          return clearHiddenClasses(el)
        end
      end
    end

    return {
      Div = clearOrRemoveEl,
      CodeBlock = clearOrRemoveEl
    }
  elseif keepHidden and not _quarto.format.isHtmlOutput() then
    return stripHiddenCellFilter
  else
    return {}
  end
end

function strip_notes_from_hidden()
  local function stripNotes(el) 
    local result = _quarto.ast.walk(el, {
      Note = function(_el)
        return pandoc.Null()
      end
    })
    return result
  end
  
  return {
    Div = function(div)
      -- Don't allow footnotes in the hidden element (markdown pipeline)
      -- since that will result in duplicate footnotes
      -- in the rendered output
      if div.classes:includes('hidden') then
        return stripNotes(div)
      end
    end,
    Span = function(span)
      -- Don't allow footnotes in the hidden element (markdown pipeline)
      -- since that will result in duplicate footnotes
      -- in the rendered output      
      if span.classes:includes('hidden') then
        return stripNotes(span)
      end
    end
  }
end
-- include-paths.lua
--
-- fixes paths from <include> directives
--
-- Copyright (C) 2022 Posit Software, PBC

function include_paths() 
  return {
    Link = function(el)
      local file = currentFileMetadataState().file
      if file ~= nil and file.include_directory ~= nil then
        el.target = fixIncludePath(el.target, file.include_directory)
      end
      return el
    end,

    Image = function(el)
      local file = currentFileMetadataState().file
      if file ~= nil and file.include_directory ~= nil then 
        el.src = fixIncludePath(el.src, file.include_directory)
      end
      return el
    end,

    RawInline = handleRawElementIncludePath,
    RawBlock = handleRawElementIncludePath,
  }
end


function handleRawElementIncludePath(el)
  if _quarto.format.isRawHtml(el) then
    local file = currentFileMetadataState().file
    if file ~= nil and file.include_directory ~= nil then
      handlePaths(el, file.include_directory, fixIncludePath)
    end
    return el
  end
end
-- input-traits.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

local constants = require("modules/constants")

function addInputTrait(key, value)
  quarto_global_state.results.inputTraits[key] = value
end

function input_traits() 
  return {
    Div = function(el) 
      if el.attr.identifier == 'refs' then
        addInputTrait(constants.kPositionedRefs, true) 
      end
    end
  }
end
-- line-numbers.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

local constants = require("modules/constants")

function line_numbers()
  return {
    CodeBlock = function(el)
      if #el.attr.classes > 0 then
        local lineNumbers = lineNumbersAttribute(el)
        el.attr.attributes[constants.kCodeLineNumbers] = nil
        if lineNumbers ~= false then
          -- use the pandoc line numbering class
          el.attr.classes:insert("number-lines")
          -- remove for all formats except reveal and docusaurus
          if type(lineNumbers) == "string" and (_quarto.format.isRevealJsOutput() or _quarto.format.isDocusaurusOutput()) then
            el.attr.attributes[constants.kCodeLineNumbers] = lineNumbers
          end
        end
        return el
      end
    end
  }
end

function lineNumbersAttribute(el)
  local default = param(constants.kCodeLineNumbers, false)
  local lineNumbers = attribute(el, constants.kCodeLineNumbers, default)
  -- format that do accept string for this attributes. "1" and "0" should not be parsed as TRUE / FALSE
  local acceptStrings = _quarto.format.isRevealJsOutput() or _quarto.format.isDocusaurusOutput()
  if lineNumbers == true or lineNumbers == "true" or (lineNumbers == "1" and not acceptStrings) then
    return true
  elseif lineNumbers == false or lineNumbers == "false" or lineNumbers == "0" then
    return false
  else
    return tostring(lineNumbers)
  end
end
-- meta.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- inject metadata
function quarto_pre_meta_inject()
  return {
    Meta = function(meta)
      
      -- injection awesomebox for captions, if needed
      if quarto_global_state.hasCallouts then
        metaInjectLatex(meta, function(inject)
          inject(
            usePackageWithOption("tcolorbox", "skins,breakable")
          )
          inject(
            usePackage("fontawesome5")
          )
          inject(
            "\\definecolor{quarto-callout-color}{HTML}{" .. kColorUnknown .. "}\n" ..
            "\\definecolor{quarto-callout-note-color}{HTML}{" .. kColorNote .. "}\n" ..
            "\\definecolor{quarto-callout-important-color}{HTML}{" .. kColorImportant .. "}\n" ..
            "\\definecolor{quarto-callout-warning-color}{HTML}{" .. kColorWarning .."}\n" ..
            "\\definecolor{quarto-callout-tip-color}{HTML}{" .. kColorTip .."}\n" ..
            "\\definecolor{quarto-callout-caution-color}{HTML}{" .. kColorCaution .. "}\n" ..
            "\\definecolor{quarto-callout-color-frame}{HTML}{" .. kColorUnknownFrame .. "}\n" ..
            "\\definecolor{quarto-callout-note-color-frame}{HTML}{" .. kColorNoteFrame .. "}\n" ..
            "\\definecolor{quarto-callout-important-color-frame}{HTML}{" .. kColorImportantFrame .. "}\n" ..
            "\\definecolor{quarto-callout-warning-color-frame}{HTML}{" .. kColorWarningFrame .."}\n" ..
            "\\definecolor{quarto-callout-tip-color-frame}{HTML}{" .. kColorTipFrame .."}\n" ..
            "\\definecolor{quarto-callout-caution-color-frame}{HTML}{" .. kColorCautionFrame .. "}\n"
          )
        end)
      end

      if quarto_global_state.usingTikz then
        metaInjectLatex(meta, function(inject)
          inject(usePackage("tikz"))
        end)
      end

      if quarto_global_state.usingBookmark then
        metaInjectLatex(meta, function(inject)
          inject(usePackage("bookmark"))    
        end)
      end

      return meta
    end
  }
end
-- options.lua
-- Copyright (C) 2020-2022 Posit Software, PBC


local allOptions = {}

-- initialize options from 'crossref' metadata value
function init_options()
  return {
    Meta = function(meta)
      if meta ~= nil then
        allOptions = readMetaOptions(meta)
      end
    end
  }
end

-- get option value
function option(name, def)
  return parseOption(name, allOptions, def)
end

function option_as_string(name)
  local result = option(name)
  if result == nil then
    return nil
  end
  return inlinesToString(result)
end

local kVarNamespace = "_quarto-vars"
function var(name, def)
  local vars = allOptions[kVarNamespace]
  if vars ~= nil then
    return parseOption(name, vars, def)
  else
    return nil
  end
end

function parseOption(name, options, def)
  name = name:gsub("%\\%.", string.char(1))
  local keys = split(name, ".")
  local value = nil
  for i, key in ipairs(keys) do
    key = key:gsub(string.char(1), "."):gsub("%\\(.)", "%1")
    if value == nil then
      value = readOption(options, key, nil)
    else
      key = tonumber(key) or key
      value = value[key]
    end

    -- the key doesn't match a value, stop indexing
    if value == nil then
      break
    end    
  end
  if value == nil then
    return def
  else
    return value
  end
end

function cap_location_from_option(scope, default)
  local loc = option(scope .. '-cap-location', option('cap-location', nil))
  if loc ~= nil then
    return inlinesToString(loc)
  else
    return default
  end
end
-- output-location.lua
-- Copyright (C) 2021-2022 Posit Software, PBC

local function collectCellOutputLocation(el)
  if is_regular_node(el, "Div") and 
     el.attr.classes:includes("cell")  then
    local outputLoc = el.attr.attributes["output-location"]
    el.attr.attributes["output-location"] = nil 
    if outputLoc == nil then
      outputLoc = param('output-location')
    end
    return outputLoc
  else
    return nil
  end
        
end

local function outputLocationCellHasCode(el)
  return #el.content > 0 and
         el.content[1].t == "CodeBlock" and
         el.content[1].attr.classes:includes("cell-code")  
end

-- note: assumes that outputLocationCellHasCode has been called
local function partitionCell(el, outputClass)
  -- compute the code div, being sure to bring the annotations 
  -- along with the code
  local code = { el.content[1] }
  local outputIndex
  if isAnnotationCell(el.content[2]) then
    tappend(code, {el.content[2]})
    outputIndex = 3
  else
    outputIndex = 2
  end

  local codeDiv = pandoc.Div(code, el.attr)

  local outputDiv = pandoc.Div(tslice(el.content, outputIndex, #el.content), el.attr)
  outputDiv.attr.identifier = ""
  outputDiv.attr.classes:insert(outputClass)
  return { codeDiv, outputDiv }
end

local function fragmentOutputLocation(block)
  return partitionCell(block, "fragment")
end

local function slideOutputLocation(block)
  return partitionCell(block, "output-location-slide")
end

local function columnOutputLocation(el, fragment)
  local codeDiv = pandoc.Div({ el.content[1] })
  local outputDiv = pandoc.Div(tslice(el.content, 2, #el.content))
  codeDiv.attr.classes:insert("column")
  outputDiv.attr.identifier = ""
  outputDiv.attr.classes:insert("column")
  if fragment then
    outputDiv.attr.classes:insert("fragment")
  end
  local columnsDiv = pandoc.Div( {codeDiv, outputDiv}, el.attr )
  tappend(columnsDiv.attr.classes, {
    "columns", "column-output-location"
  })
  return { columnsDiv }
end

function output_location()
  if _quarto.format.isRevealJsOutput() then
    return {
      Blocks = function(blocks)
        local newBlocks = pandoc.Blocks{}
        for _,block in pairs(blocks) do
          local outputLoc = collectCellOutputLocation(block)
          if outputLoc then
            if outputLocationCellHasCode(block) then
              if outputLoc == "fragment" then
                tappend(newBlocks, fragmentOutputLocation(block))
              elseif outputLoc == "column" then
                tappend(newBlocks, columnOutputLocation(block))
              elseif outputLoc == "column-fragment" then
                tappend(newBlocks, columnOutputLocation(block, true))
              elseif outputLoc == "slide" then
                tappend(newBlocks, slideOutputLocation(block))
              else
                newBlocks:insert(block)
              end
            else
              warn("output-location is only valid for cells that echo their code")
              newBlocks:insert(block)
            end
          else
            newBlocks:insert(block)
          end
        end
        return newBlocks
      end
    }
  else
    return {}
  end
 
end






function unroll_cell_outputs()
  -- the param("output-divs", true) check is now done in flags.lua

  local function has_ojs_content(div)
    local ojs_content = false
    _quarto.ast.walk(div, {
      Div = function(el)
        if el.identifier:match("ojs%-cell%-") then
          ojs_content = true
        end
      end
    })
    return ojs_content
  end

  return {
    -- unroll output divs for formats (like pptx) that don't support them
    Div = function(div)

      -- if we don't support output divs then we need to unroll them
      if tcontains(div.attr.classes, "cell") then
        -- if this is PowerPoint and it's a figure panel then let it through (as
        -- we'll use PowerPoint columns to layout at least 2 figures side-by-side)
        if (_quarto.format.isPowerPointOutput() and hasLayoutAttributes(div)) or
           (_quarto.format.isHugoMarkdownOutput() and has_ojs_content(div)) then
          return nil
        end

        -- unroll blocks contained in divs
        local blocks = pandoc.List()
        for _, childBlock in ipairs(div.content) do
          if is_regular_node(childBlock, "Div") and not is_custom_node(childBlock) then
            tappend(blocks, childBlock.content)
          else
            blocks:insert(childBlock)
          end
        end
    
        return blocks
      end
    end
  }
end
-- panel-input.lua
-- Copyright (C) 2021-2022 Posit Software, PBC

function bootstrap_panel_input() 

  return {
    Div = function(el)
      if hasBootstrap() and el.attr.classes:find("panel-input") then
        tappend(el.attr.classes, {
          "card",
          "bg-light",
          "p-2",
        })
      end
      return el
    end
  }


end

-- panel-layout.lua
-- Copyright (C) 2021-2022 Posit Software, PBC

function bootstrap_panel_layout() 

  return {
    Div = function(el)
      if (hasBootstrap() and is_regular_node(el, "Div")) then
        local fill = el.attr.classes:find("panel-fill")
        local center = el.attr.classes:find("panel-center")
        if fill or center then
          local layoutClass =  fill and "panel-fill" or "panel-center"
          local div = pandoc.Div({ el })
          el.attr.classes = el.attr.classes:filter(function(clz) return clz ~= layoutClass end)
          if fill then
            tappend(div.attr.classes, {
              "g-col-24",
            })
          elseif center then
            tappend(div.attr.classes, {
              "g-col-24",
              "g-col-lg-20",
              "g-start-lg-2"
            })
          end
          -- return wrapped in a raw
          return pandoc.Div({ div }, pandoc.Attr("", { 
            layoutClass,
            "panel-grid"
          }))
        end
      end
      return el
    end
  }
  
end

function panel_insert_preamble(result, preamble)
  if preamble == nil then
    return
  end

  local pt = pandoc.utils.type(preamble)
  if preamble.content and #preamble.content > 0 then
    result:extend(preamble.content)
  elseif pt == "Inline" or pt == "Block" then
    result:insert(preamble)
  elseif pt == "Blocks" then
    result:extend(preamble)
  else
    fail("Don't know what to do with preamble of type " .. pt)
    return nil
  end
end
-- panel-sidebar.lua
-- Copyright (C) 2021-2022 Posit Software, PBC

function bootstrap_panel_sidebar() 
  return {
    Blocks = function(blocks)
      if hasBootstrap() or _quarto.format.isRevealJsOutput() then

        -- functions to determine if an element has a layout class
        local function isSidebar(el)
          return el ~= nil and is_regular_node(el, "Div") and el.attr.classes:includes("panel-sidebar")
        end
        local function isTabset(el) return is_custom_node(el, "Tabset") end
        local function fillPanel(el) return pandoc.Div({ el }, pandoc.Attr("", {"panel-fill"})) end
        local function isContainer(el)
          return el ~= nil and
                 is_regular_node(el, "Div") and 
                 (el.attr.classes:includes("panel-fill") or 
                  el.attr.classes:includes("panel-center") or
                  isTabset(el))
        end
        local function isHeader(el)
          return el ~= nil and el.t == "Header"
        end
        local function isQuartoHiddenDiv(el)
          return el ~= nil and is_regular_node(el, "Div") and
                 string.find(el.attr.identifier, "^quarto%-") and
                 el.attr.classes:includes("hidden")
        end
        local function isNotQuartoHiddenDiv(el)
          return not isQuartoHiddenDiv(el)
        end

        -- bail if there are no sidebars
        local sidebar, sidebarIdx = blocks:find_if(isSidebar)
        if not sidebar then
          return blocks
        end

        -- create sidebar handler and get attr
        local sidebarHandler = bootstrapSidebar()
        if _quarto.format.isRevealJsOutput() then
          sidebarHandler = revealSidebar()
        end
        local sidebarAttr = sidebarHandler.sidebarAttr()
        local containerAttr = sidebarHandler.containerAttr()
    
        -- filter out quarto hidden blocks (they'll get put back in after processing)
        local quartoHiddenDivs = blocks:filter(isQuartoHiddenDiv)
        blocks = blocks:filter(isNotQuartoHiddenDiv)

        -- locate and arrange sidebars until there are none left
        local sidebar, sidebarIdx = blocks:find_if(isSidebar)
       
        while sidebar ~= nil and sidebarIdx ~= nil do

          -- always transfer sidebar attributes to sidebar
          transferAttr(sidebarAttr, sidebar.attr)

          -- sidebar after container
          if isContainer(blocks[sidebarIdx - 1]) then
            blocks:remove(sidebarIdx)
            local container = blocks:remove(sidebarIdx - 1)
            if isTabset(container) then
              container = fillPanel(container)
            end
            transferAttr(containerAttr, container.attr)
            blocks:insert(sidebarIdx - 1, 
              pandoc.Div({ container, sidebar }, sidebarHandler.rowAttr({"layout-sidebar-right"}))
            )
          -- sidebar before container
          elseif isContainer(blocks[sidebarIdx + 1]) then
            local container = blocks:remove(sidebarIdx + 1)
            if isTabset(container) then
              container = fillPanel(container)
            end
            transferAttr(containerAttr, container.attr)
            blocks:remove(sidebarIdx)
            blocks:insert(sidebarIdx, 
              pandoc.Div({ sidebar, container }, sidebarHandler.rowAttr({"layout-sidebar-left"}))
            )
          else
            -- look forward for a header
            local header, headerIdx = blocks:find_if(isHeader, sidebarIdx)
            if header and headerIdx and (headerIdx ~= (sidebarIdx + 1)) then
              local panelBlocks = pandoc.List()
              for i = sidebarIdx + 1, headerIdx - 1, 1 do
                panelBlocks:insert(blocks:remove(sidebarIdx + 1))
              end
              local panelFill = pandoc.Div(panelBlocks, pandoc.Attr("", { "panel-fill" }))
              transferAttr(containerAttr, panelFill)
              blocks:remove(sidebarIdx)
              blocks:insert(sidebarIdx, 
                pandoc.Div({ sidebar,  panelFill }, sidebarHandler.rowAttr({"layout-sidebar-left"}))
              )
            else
              -- look backwards for a header 
              
              headerIdx = nil
              for i = sidebarIdx - 1, 1, -1 do
                if isHeader(blocks[i]) then
                  headerIdx = i
                  break
                end
              end
              -- if we have a header then collect up to it
              if headerIdx ~= nil and (headerIdx ~= (sidebarIdx - 1)) then
                local panelBlocks = pandoc.List()
                for i = headerIdx + 1, sidebarIdx - 1, 1 do
                  panelBlocks:insert(blocks:remove(headerIdx + 1))
                end
                local panelFill = pandoc.Div(panelBlocks,  pandoc.Attr("", { "panel-fill" }))
                transferAttr(containerAttr, panelFill)
                blocks:remove(headerIdx + 1)
                blocks:insert(headerIdx + 1, 
                  pandoc.Div({ panelFill, sidebar }, sidebarHandler.rowAttr({"layout-sidebar-right"}))
                )
              else
                --  no implicit header containment found, strip the sidebar attribute
                sidebar.attr.classes = sidebar.attr.classes:filter(
                  function(clz) 
                    return clz ~= "panel-sidebar" and clz ~= "panel-input"
                  end
                )
              end
            end
          end

          -- try to find another sidebar
          sidebar, sidebarIdx = blocks:find_if(isSidebar)
        end

        -- restore hidden divs and return blocks
        tappend(blocks, quartoHiddenDivs)
        return blocks
      end
    end
  }
end

function bootstrapSidebar()
  return {
    rowAttr = function(classes)
      local attr = pandoc.Attr("", {
        "panel-grid", 
        "layout-sidebar",
        "ms-md-0"
      })
      tappend(attr.classes, classes)
      return attr
    end,
    sidebarAttr = function()
      return pandoc.Attr("", {
        "card",
        "bg-light",
        "p-2",
        "g-col-24",
        "g-col-lg-7"
      })
    end,
    containerAttr = function()
      return pandoc.Attr("", {
        "g-col-24",
        "g-col-lg-17",
        "pt-3",
        "pt-lg-0",
      })
    end
  }
end

function revealSidebar()
  return {
    rowAttr = function(classes) 
      local attr = pandoc.Attr("", { "layout-sidebar" })
      tappend(attr.classes, classes)
      return attr
    end,
    sidebarAttr = function()
      local attr = pandoc.Attr("", {})
      return attr
    end,
    containerAttr = function()
      return pandoc.Attr("")
    end
  }
end

function transferAttr(from, to)
  tappend(to.classes, from.classes)
  for k,v in pairs(from.attributes) do
    to.attributes[k] = v
  end
end
-- parsefiguredivs.lua
-- Copyright (C) 2023 Posit Software, PBC

local patterns = require("modules/patterns")

local attributes_to_not_merge = pandoc.List({
  "width", "height"
})

-- Narrow fix for #8000
local classes_to_not_merge = pandoc.List({
  "border"
})

-- function handle_subfloatreftargets()
--   return {
--     FloatRefTarget = 
--   }
-- end

local function process_div_caption_classes(div)
  -- knitr forwards "cap-location: top" as `.caption-top`...
  -- and in that case we don't know if it's a fig- or a tbl- :facepalm:
  -- so we have to use cap-locatin generically in the attribute
  if div.classes:find_if(
    function(class) return class:match("caption%-.+") end) then
    local matching_classes = div.classes:filter(function(class)
      return class:match("caption%-.+")
    end)
    div.classes = div.classes:filter(function(class)
      return not class:match("caption%-.+")
    end)
    for i, c in ipairs(matching_classes) do
      div.attributes["cap-location"] = c:match("caption%-(.+)")
    end
    return true
  end
  return false
end

local function coalesce_code_blocks(content)
  local result = pandoc.Blocks({})
  local state = "start"
  for _, element in ipairs(content) do
    if state == "start" then
      if is_regular_node(element, "CodeBlock") then
        state = "coalescing"
      end
      result:insert(element)
    elseif state == "coalescing" then
      if is_regular_node(element, "CodeBlock") and result[#result].attr == element.attr then
        result[#result].text = result[#result].text .. "\n" .. element.text
      else
        state = "start"
        result:insert(element)
      end
    end
  end
  return result
end

local function remove_latex_crossref_envs(content, name)
  if name == "Table" then
    return _quarto.ast.walk(content, {
      RawBlock = function(raw)
        if not _quarto.format.isRawLatex(raw) then
          return nil
        end
        local matched, _ = _quarto.modules.patterns.match_in_list_of_patterns(raw.text, _quarto.patterns.latexTableEnvPatterns)
        if matched then
          -- table_body is second matched element.
          raw.text = matched[2]
          return raw
        else
          return nil
        end
      end
    })
  end
  return content
end

local function kable_raw_latex_fixups(content, identifier)
  local matches = 0

  content = _quarto.ast.walk(content, {
    RawBlock = function(raw)
      if not _quarto.format.isRawLatex(raw) then
        return nil
      end
      if raw.text:match(patterns.latex_long_table) == nil then
        return nil
      end
      local b, e, match1, label_identifier = raw.text:find(patterns.latex_label)
      if b ~= nil then
        raw.text = raw.text:sub(1, b - 1) .. raw.text:sub(e + 1)
      end
      local b, e, match2, caption_content = raw.text:find(patterns.latex_caption)
      if b ~= nil then
        raw.text = raw.text:sub(1, b - 1) .. raw.text:sub(e + 1)
      end


      if match1 == nil and match2 == nil then
        return nil
      end
      -- it's a longtable, we'll put it inside a Table FloatRefTarget
      -- if it has either a label or a caption.

      -- HACK: kable appears to emit a label that starts with "tab:"
      -- we strip this and hope for the best
      if label_identifier ~= nil then
        label_identifier = label_identifier:gsub("^tab:", "")
      end

      -- we found a table, a label, and a caption. This is a FloatRefTarget.
      matches = matches + 1

      -- other FloatRefTarget constructions below go through
      -- a recursion step to identify subfloats, but we don't have
      -- to do that here, since we know that the content of this FloatRefTarget
      -- is a single table.
      return quarto.FloatRefTarget({
        identifier = label_identifier,
        type = "Table",
        content = pandoc.Blocks({ raw }),
        caption_long = pandoc.Blocks({pandoc.Plain(string_to_quarto_ast_inlines(caption_content or ""))}),
      })
    end
  })

  if matches > 1 then
    -- we found more than one table, so these will become subfloats and
    -- we might need auto-identifiers (since)
    local counter = 0
    content = _quarto.ast.walk(content, {
      FloatRefTarget = function(target)
        counter = counter + 1
        if target.identifier == identifier then
          target.identifier = identifier .. "-" .. tostring(counter) 
        end
        return target
      end
    })
  end

  return matches, content
end

function parse_floatreftargets()

  local filter

  local function construct(tbl)
    local new_content = _quarto.ast.walk(tbl.content, filter)

    -- #7045: pull fig-pos and fig-env attributes from subfloat to parent
    local pulled_attrs = {}
    local attrs_to_pull = {
      "fig-pos",
      "fig-env",
    }
    new_content = _quarto.ast.walk(new_content, {
      FloatRefTarget = function(subfloat)
        for _, attr in ipairs(attrs_to_pull) do
          if subfloat.attributes[attr] then
            pulled_attrs[attr] = subfloat.attributes[attr]
            subfloat.attributes[attr] = nil
          end
        end
        return subfloat
      end      
    })
    local inner_tbl = {}
    for k, v in pairs(tbl) do
      inner_tbl[k] = v
    end
    for k, v in pairs(pulled_attrs) do
      inner_tbl.attr.attributes[k] = v
    end
    inner_tbl.content = new_content
    return quarto.FloatRefTarget(inner_tbl)
  end

  local function handle_subcells_as_subfloats(params)  
    local identifier = params.identifier
    local div = params.div
    local content = params.content
    local ref = params.ref
    local category = params.category
    local subcaps = params.subcaps

    div.attributes[ref .. "-subcap"] = nil
    local subcap_index = 0
    local subcells = pandoc.List({})
    content = _quarto.ast.walk(content, {
      Div = function(subdiv)
        if not subdiv.classes:includes("cell-output-display") then
          return nil
        end
        subcap_index = subcap_index + 1
        local subfloat = construct({
          attr = pandoc.Attr(identifier .. "-" .. tostring(subcap_index), {}, {}),
          type = category.name,
          content = pandoc.Blocks{subdiv},
          caption_long = {pandoc.Plain(string_to_quarto_ast_inlines(subcaps[subcap_index]))},
        })
        subcells:insert(subfloat)
        return {}
      end
    })
    content = coalesce_code_blocks(content)
    content:extend(subcells)
    return content
  end
  
  local function parse_float_div(div)
    process_div_caption_classes(div)
    local ref = refType(div.identifier)
    if ref == nil then
      fail("Float div without crossref identifier?")
      return
    end
    local category = crossref.categories.by_ref_type[ref]
    if category == nil then
      fail("Float with invalid crossref category? " .. div.identifier)
      return
    end
    if category.kind ~= "float" then
      return nil -- skip non-float reftargets now that they exist
    end

    local content = div.content
    local caption_attr_key = ref .. "-cap"

    -- caption location handling

    -- .*-cap-location
    local caption_location_attr_key = ref .. "-cap-location"
    local caption_location_class_pattern = ".*cap%-location%-(.*)"
    local caption_location_classes = div.classes:filter(function(class)
      return class:match(caption_location_class_pattern)
    end)

    if #caption_location_classes then
      div.classes = div.classes:filter(function(class)
        return not class:match(caption_location_class_pattern)
      end)
      for _, class in ipairs(caption_location_classes) do
        local c = class:match(caption_location_class_pattern)
        div.attributes[caption_location_attr_key] = c
      end
    end
    local caption = refCaptionFromDiv(div)
    if caption ~= nil then
      div.content:remove()  -- drop the last element
    elseif div.attributes[caption_attr_key] ~= nil then
      caption = pandoc.Plain(string_to_quarto_ast_inlines(div.attributes[caption_attr_key]))
      div.attributes[caption_attr_key] = nil
    elseif ref == "lst" then
      -- For listings from cell options, the caption may be on a nested CodeBlock
      _quarto.ast.walk(content, {
        CodeBlock = function(code)
          if code.attr.attributes[caption_attr_key] then
            caption = pandoc.Plain(string_to_quarto_ast_inlines(code.attr.attributes[caption_attr_key]))
            code.attr.attributes[caption_attr_key] = nil
          end
        end
      })
    end
    if caption == nil then
      -- it's possible that the content of this div includes a table with a caption
      -- so we'll go root around for that.
      local found_caption = false
      content = _quarto.ast.walk(content, {
        Table = function(table)
          -- check if caption is non-empty
          if table.caption.long and next(table.caption.long) then
            found_caption = true
            caption = table.caption.long[1] -- what if there's more than one entry here?
            -- table caption should be removed from the table as we'll handle it
            table.caption = pandoc.Caption{}
            return table
          end
        end
      })

      -- luacov: disable
      if content == nil then
        internal_error()
        return nil
      end
      -- luacov: enable
      
      -- TODO are there other cases where we should look for captions?
      if not found_caption then
        caption = pandoc.Plain({})
      end
    end

    if caption == nil then
      return nil
    end

    local identifier = div.identifier
    local attr = pandoc.Attr(identifier, div.classes, div.attributes)
    assert(content)
    if (#content == 1 and content[1].t == "Para" and
        content[1].content[1].t == "Image") then
      -- if the div contains a single image, then we simply use the image as
      -- the content
      content = content[1].content[1]

      -- don't merge classes because they often have CSS consequences 
      -- but merge attributes because they're needed to correctly resolve
      -- behavior such as fig-pos="h", etc
      -- See #8000.
      -- We also exclude attributes we know to not be relevant to the div
      for k, v in pairs(content.attr.attributes) do
        if not attributes_to_not_merge:includes(k) then
          attr.attributes[k] = v
        end
      end
      for _, v in ipairs(content.attr.classes) do
        if not classes_to_not_merge:includes(v) then
          attr.classes:insert(v)
        end
      end
    end

    local skip_outer_reftarget = false
    if ref == "tbl" then
      -- knitr/kable/etc fixups

      -- attempt to find table and caption
      local matches
      matches, content = kable_raw_latex_fixups(content, identifier)
      skip_outer_reftarget = matches == 1
    end

    if div.classes:includes("cell") then
      local layout_classes = attr.classes:filter(
        function(c) return c:match("^column-") end
      )
      if #layout_classes > 0 then
        -- Check if there are cell-output-display divs to forward to
        local has_cell_output_display = false
        _quarto.ast.walk(content, {
          Div = function(subdiv)
            if subdiv.classes:includes("cell-output-display") then
              has_cell_output_display = true
            end
          end
        })

        if has_cell_output_display then
          -- Forward layout classes to cell-output-display divs
          content = _quarto.ast.walk(content, {
            Div = function(subdiv)
              if subdiv.classes:includes("cell-output-display") then
                subdiv.classes:extend(layout_classes)
                return _quarto.ast.walk(subdiv, {
                  Table = function(tbl)
                    tbl.classes:insert("do-not-create-environment")
                    return tbl
                  end
                })
              end
            end
          })
          -- Remove layout classes from div
          div.classes = div.classes:filter(
            function(c) return not layout_classes:includes(c) end)
          -- Strip fullwidth layout classes from attr (columns.lua handles wideblock wrapping)
          -- but keep margin classes so FloatRefTarget can use notefigure
          attr.classes = attr.classes:filter(function(c)
            if c == "column-margin" or c == "aside" then
              return true  -- keep margin classes
            end
            return not layout_classes:includes(c)  -- strip other layout classes
          end)
        end
        -- If no cell-output-display (e.g., listings with echo:true eval:false),
        -- keep layout_classes on attr so the FloatRefTarget inherits them
      end
    end

    content = remove_latex_crossref_envs(content, category.name)

    -- respect single table in latex longtable fixups above
    if skip_outer_reftarget then
      -- we also need to strip the div identifier here
      -- or we end up with duplicate identifiers which latex doesn't like
      div.identifier = ""
      div.content = content
      return div
    end

    if div.classes:includes("cell") and div.attributes["layout-ncol"] == nil then
      -- if this is a non-layout cell, we need to splice the code out of the
      -- cell-output-display div
      -- 
      -- layout cells do their own processing later

      local return_cell = pandoc.Div({})
      local final_content = pandoc.Div({})
      local found_cell_output_display = false
      for _, element in ipairs(content or {}) do
        if is_regular_node(element, "Div") and element.classes:includes("cell-output-display") then
          found_cell_output_display = true
          final_content.content:insert(element)
        else
          return_cell.content:insert(element)
        end
      end

      if found_cell_output_display then
        return_cell.content = coalesce_code_blocks(return_cell.content)
        return_cell.classes = div.classes
        return_cell.attributes = div.attributes
        local reftarget = construct({
          attr = attr,
          type = category.name,
          content = final_content.content,
          caption_long = {pandoc.Plain(caption.content)},
        })
        -- need to reference as a local variable because of the
        -- second return value from the constructor
        return_cell.content:insert(reftarget)
        return return_cell
      end
    end

    -- if we're here, then we're going to return a FloatRefTarget
    -- 
    -- it's possible that the _contents_ of this FloatRefTarget should
    -- be interpreted as subfloats.
    -- 
    -- See https://github.com/quarto-dev/quarto-cli/issues/10328
    --
    -- We'll use the following heuristic: if the FloatRefTarget contains
    -- a subcap attribute with exactly as many entries as the number of
    -- div children with class cell-output-display, then we'll interpret
    -- each of those children as a subfloat.

    local nsubcells = 0
    content = _quarto.ast.walk(content, {
      Div = function(subdiv)
        if subdiv.classes:includes("cell-output-display") then
          nsubcells = nsubcells + 1
        end
      end
    })
    local subcaps = div.attributes[ref .. "-subcap"] or "[]"
    if subcaps ~= nil then
      subcaps = quarto.json.decode(subcaps)
    end

    if nsubcells == #subcaps and nsubcells > 0 then
      content = handle_subcells_as_subfloats {
        div = div,
        content = content,
        identifier = identifier,
        ref = ref,
        category = category,
        subcaps = subcaps
      }
    end

    return construct({
      attr = attr,
      type = category.name,
      content = content,
      caption_long = {pandoc.Plain(caption.content)},
    }), false
  end

  filter = {
    traverse = "topdown",
    Figure = function(fig)
      local key_prefix = refType(fig.identifier)
      if key_prefix == nil then
        return nil
      end
      local category = crossref.categories.by_ref_type[key_prefix]
      if category == nil then
        return nil
      end
      if #fig.content ~= 1 and fig.content[1].t ~= "Plain" then
        -- we don't know how to parse this pandoc 3 figure
        -- just return as is
        return nil
      end

      local fig_attr = fig.attr
      local new_content = _quarto.ast.walk(fig.content[1], {
        Image = function(image)
          -- don't merge classes because they often have CSS consequences 
          -- but merge attributes because they're needed to correctly resolve
          -- behavior such as fig-pos="h", etc
          -- See #8000.
          for k, v in pairs(image.attributes) do
            if not attributes_to_not_merge:includes(k) then
              fig_attr.attributes[k] = v
            end
          end    
          for _, v in ipairs(image.classes) do
            if not classes_to_not_merge:includes(v) then
              fig_attr.classes:insert(v)
            end
          end
          image.caption = pandoc.Inlines{}
          return image
        end
      }) or fig.content[1] -- this shouldn't be needed but the lua analyzer doesn't know it

      return construct({
        attr = fig_attr,
        type = category.name,
        content = new_content.content,
        caption_long = fig.caption.long,
        caption_short = fig.caption.short,
      }), false
    end,

    -- if we see a table with a caption that includes a tbl- label, then
    -- we normalize that to a FloatRefTarget
    Table = function(el)
      if el.caption.long == nil then
        return nil
      end
      local last = el.caption.long[#el.caption.long]
      if not last or #last.content == 0 then
        return nil
      end

      -- check for tbl label
      local label = el.identifier
      local caption, attr = parseTableCaption(last.content)
      if startsWith(attr.identifier, "tbl-") then
        -- set the label and remove it from the caption
        label = attr.identifier
        attr.identifier = ""
        caption = createTableCaption(caption, pandoc.Attr())
      end
      
      -- we've parsed the caption, so we can remove it from the table
      el.caption.long = pandoc.Blocks({})

      if label == "" then
        return nil
      end

      local combined = merge_attrs(el.attr, attr)

      return construct({
        identifier = label,
        classes = combined.classes,
        attributes = as_plain_table(combined.attributes),
        type = "Table",
        content = pandoc.Blocks({ el }),
        caption_long = caption,
      }), false
    end,

    Div = function(div)
      if isFigureDiv(div, false) then
        -- The code below is a fixup that existed since the very beginning of
        -- quarto, see https://github.com/quarto-dev/quarto-cli/commit/12e770616869d43f5a1a3f84f9352491a2034bde
        -- and parent commits. We replicate it here to try and
        -- avoid a regression, in the absence of an associated regression test.
        --
        -- pandoc sometimes ends up with a fig prefixed title
        -- (no idea why right now!)
        div = _quarto.ast.walk(div, {
          Image = function(image)
            if image.title == "fig:" or image.title == "fig-" then
              image.title = ""
              return image
            end
          end
        })
        return parse_float_div(div)
      end

      if div.classes:includes("cell") then
        process_div_caption_classes(div)
        -- forward cell attributes to potential FloatRefTargets
        div = _quarto.ast.walk(div, {
          Figure = function(fig)
            if div.attributes["cap-location"] then
              fig.attributes["cap-location"] = div.attributes["cap-location"]
            end
            for i, c in ipairs(div.classes) do
              local c = c:match(".*%-?cap%-location%-(.*)")
              if c then
                fig.attributes["cap-location"] = c
              end
            end
            return fig
          end,
          CodeBlock = function(block)
            for _, k in ipairs({"cap-location", "lst-cap-location"}) do
              if div.attributes[k] then
                block.attributes[k] = div.attributes[k]
              end
            end
            for i, c in ipairs(div.classes) do
              local c = c:match(".*%-?cap%-location%-(.*)")
              if c then
                block.attributes["cap-location"] = c
              end
            end
            return block
          end,
        })
        return div
      end
    end,

    Para = function(para)
      local img = discoverFigure(para, false)
      if img ~= nil then
        if img.identifier == "" and #img.caption == 0 then
          return nil
        end
        if img.identifier == "" then
          img.identifier = autoRefLabel("fig")
        end
        local identifier = img.identifier
        local type = refType(identifier)
        local category = crossref.categories.by_ref_type[type]
        if category == nil then
          -- We've had too many reports of false positives for this, so we're disabling the warning
          -- warn("Figure with invalid crossref category: " .. identifier .. "\nWon't be able to cross-reference this figure.")
          return nil
        end
        return construct({
          identifier = identifier,
          classes = {}, 
          attributes = as_plain_table(img.attributes),
          type = category.name,
          content = img,
          caption_long = img.caption,
        }), false
      end
      if discoverLinkedFigure(para) ~= nil then
        local link = para.content[1]
        local img = link.content[1]
        local identifier = img.identifier
        if img.identifier == "" then
          local caption = img.caption
          if #caption > 0 then
            img.caption = pandoc.Inlines{}
            return pandoc.Figure(link, { long = { caption } })
          else
            return nil
            -- return pandoc.Figure(link)
          end
        end
        img.identifier = ""
        local type = refType(identifier)
        local category = crossref.categories.by_ref_type[type]
        if category == nil then
          fail("Figure with invalid crossref category? " .. identifier)
          return
        end
        local combined = merge_attrs(img.attr, link.attr)
        return construct({
          identifier = identifier,
          classes = combined.classes,
          attributes = as_plain_table(combined.attributes),
          type = category.name,
          content = link,
          caption_long = img.caption,
        }), false
      end
    end,

    DecoratedCodeBlock = function(decorated_code)
      local code = decorated_code.code_block
      local key_prefix = refType(code.identifier)
      if key_prefix ~= "lst" then
        return nil
      end
      local caption = code.attr.attributes['lst-cap']
      if caption == nil then
        return nil
      end
      code.attr.attributes['lst-cap'] = nil
      
      local attr = pandoc.Attr(code.identifier, code.attr.classes, code.attr.attributes)
      code.attr = pandoc.Attr("", code.classes, code.attr.attributes)
      return construct({
        attr = attr,
        type = "Listing",
        content = pandoc.Blocks{ decorated_code.__quarto_custom_node }, -- this custom AST impedance mismatch here is unfortunate
        caption_long = caption,
      }), false
    end,

    CodeBlock = function(code)
      local key_prefix = refType(code.identifier)
      if key_prefix ~= "lst" then
        return nil
      end
      local caption = code.attr.attributes['lst-cap']
      if caption == nil then
        return nil
      end
      local caption_inlines = string_to_quarto_ast_blocks(caption)[1].content
      code.attr.attributes['lst-cap'] = nil
      local content = code
      if code.attr.attributes["filename"] then
        content = quarto.DecoratedCodeBlock({
          filename = code.attr.attributes["filename"],
          code_block = code:clone()
        })
      end
      
      local attr = code.attr
      code.attr = pandoc.Attr("", code.classes, code.attr.attributes)
      return construct({
        attr = attr,
        type = "Listing",
        content = pandoc.Blocks({ content }),
        caption_long = caption_inlines,
      }), false
    end,

    RawBlock = function(raw)
      if not (_quarto.format.isLatexOutput() and 
              _quarto.format.isRawLatex(raw)) then
        return nil
      end

      -- prevent raw mutation
      local rawText = raw.text

      -- first we check if all of the expected bits are present

      -- check for {#...} or \label{...}
      if rawText:find(patterns.latex_label) == nil and 
         rawText:find(patterns.attr_identifier) == nil then
        return nil
      end

      -- check for \caption{...}
      if rawText:find(patterns.latex_caption) == nil then
        return nil
      end

      -- check for tabular or longtable
      if rawText:find(patterns.latex_long_table) == nil and
         rawText:find(patterns.latex_tabular) == nil then
        return nil
      end
      
      -- if we're here, then we're going to parse this as a FloatRefTarget
      -- and we need to remove the label and caption from the raw block
      local identifier = ""
      local b, e, _ , label_identifier = rawText:find(patterns.latex_label)
      if b ~= nil then
        rawText = rawText:sub(1, b - 1) .. rawText:sub(e + 1)
        identifier = label_identifier
      else
        local b, e, _ , attr_identifier = rawText:find(patterns.attr_identifier)
        if b ~= nil then
          rawText = rawText:sub(1, b - 1) .. rawText:sub(e + 1)
          identifier = attr_identifier
        else
          internal_error()
          return nil
        end
      end

      -- knitr can emit a label that starts with "tab:"
      -- we don't handle those as floats
      local ref = refType(identifier)
      -- https://github.com/quarto-dev/quarto-cli/issues/8841#issuecomment-1959667121
      if ref ~= "tbl" then
        warn("Raw LaTeX table found with non-tbl label: " .. identifier .. "\nWon't be able to cross-reference this table using Quarto's native crossref system.")
        return nil
      end

      local caption
      local b, e, _, caption_content = rawText:find(patterns.latex_caption)
      if b ~= nil then
        rawText = rawText:sub(1, b - 1) .. rawText:sub(e + 1)
        caption = pandoc.RawBlock("latex", caption_content)
      else
        internal_error()
        return nil
      end

      -- finally, if the user passed a \\begin{table} float environment
      -- we just remove it because we'll re-emit later ourselves  
      local matched, _ = _quarto.modules.patterns.match_in_list_of_patterns(rawText, _quarto.patterns.latexTableEnvPatterns)
      if matched then
        -- table_body is second matched element.
        rawText = matched[2]
      end

      return construct({
        attr = pandoc.Attr(identifier, {}, {}),
        type = "Table",
        content = pandoc.Blocks({ pandoc.RawBlock(raw.format, rawText) }),
        caption_long = quarto.utils.as_blocks(caption)
      }), false
    end
    
  }

  return filter
end

function forward_cell_subcaps()
  return {
    Div = function(div)
      if not div.classes:includes("cell") then
        return nil
      end
      local ref = refType(div.identifier)
      if ref == nil then
        return nil
      end
      local v = div.attributes[ref .. "-subcap"]
      if v == nil then
        return nil
      end
      local subcaps = quarto.json.decode(v)
      local index = 1
      local nsubcaps
      if type(subcaps) == "table" then
        nsubcaps = #subcaps
      end
      div.content = _quarto.traverser(div.content, {
        Div = function(subdiv)
          if type(nsubcaps) == "number" and index > nsubcaps or not subdiv.classes:includes("cell-output-display") then
            return nil
          end
          local function get_subcap()
            if type(subcaps) ~= "table" then
              return pandoc.Str("")
            else
              return pandoc.Str(subcaps[index] or "")
            end
          end
          -- now we attempt to insert subcaptions where it makes sense for them to be inserted
          subdiv.content = _quarto.traverser(subdiv.content, {
            Table = function(pandoc_table)
              pandoc_table.caption.long = quarto.utils.as_blocks(get_subcap())
              pandoc_table.identifier = div.identifier .. "-" .. tostring(index)
              index = index + 1
              return pandoc_table
            end,
            Para = function(maybe_float)
              local fig = discoverFigure(maybe_float, false) or discoverLinkedFigure(maybe_float, false)
              if fig ~= nil then
                fig.caption = quarto.utils.as_inlines(get_subcap())
                fig.identifier = div.identifier .. "-" .. tostring(index)
                index = index + 1
                return maybe_float
              end
            end,
          })
          return subdiv
        end
      })
      if index ~= 1 then
        div.attributes[ref .. "-subcap"] = nil
      end
      return div
    end
  }
end
-- parseblockreftargets.lua
-- Copyright (C) 2023 Posit Software, PBC

-- parses Proofs, Theorems, Lemmas, etc.

function parse_blockreftargets()

  local function parse_theorem_div(el)
    if not has_theorem_ref(el) then
      return
    end
    -- capture then remove name
    local name = string_to_quarto_ast_inlines(el.attr.attributes["name"] or "")
    if not name or #name == 0 then
      name = resolveHeadingCaption(el)
    end
    el.attr.attributes["name"] = nil 
    local identifier = el.attr.identifier
    -- remove identifier to avoid infinite recursion
    el.attr.identifier = ""
    return quarto.Theorem {
      identifier = identifier,
      name = name,
      div = el
    }, false
  end

  local function parse_proof_div(el)
    if not is_proof_div(el) then
      return
    end

    local name = string_to_quarto_ast_inlines(el.attributes["name"] or "")
    if not name or #name == 0 then
      name = resolveHeadingCaption(el)
    end
    el.attributes["name"] = nil 
    local identifier = el.identifier
    el.identifier = ""

    local ref = refType(identifier)
    local proof_type
    if ref ~= nil then
      proof_type = crossref.categories.by_ref_type[ref].name
    else
      proof_type = el.classes:find_if(function(clz) return proof_types[clz] ~= nil end)
      if proof_type == nil then
        internal_error()
        return
      end
      proof_type = proof_types[proof_type].title
    end
    el.classes = el.classes:filter(function(clz) return proof_types[clz] == nil end)
    crossref.using_theorems = true
    local tbl = {
      identifier = identifier,
      name = name,
      div = el,
      type = proof_type
    }
    return quarto.Proof(tbl), false
  end

  return {
    Div = function(div)
      if is_theorem_div(div) then
        return parse_theorem_div(div)
      elseif is_proof_div(div) then
        return parse_proof_div(div)
      end
    end
  }
end
-- project_paths.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

local constants = require("modules/constants")

local function resolveProjectPath(path)
  local offset = _quarto.projectOffset()
  if offset and path and startsWith(path, '/') then
    return pandoc.path.join({offset, pandoc.text.sub(path, 2, #path)})
  else
    return nil
  end
end

-- resources that have '/' prefixed paths are treated as project
-- relative paths if there is a project context. For HTML output, 
-- these elements are dealt with in a post processor in website-resources.ts:resolveTag()
-- but for non-HTML output, we fix these here.
function project_paths()
  return {
    Image = function(el)
      if el.attr.attributes[constants.kProjectResolverIgnore] then
        el.attr.attributes[constants.kProjectResolverIgnore] = ''
        return el
      end

      local resolved = false

      -- Resolve the image source
      if el.src then
        local resolvedPath = resolveProjectPath(el.src)
        if resolvedPath ~= nil then
          el.src = resolvedPath
          resolved = true
        end
      end

      -- Resolve image data-src
      if el.attributes['data-src'] then
        local resolvedPath = resolveProjectPath(el.attributes['data-src'])
        if resolvedPath ~= nil then
          el.attributes['data-src'] = resolvedPath
          resolved = true
        end
      end

      if resolved then
        return el
      end
    end,

    Link = function(el)
      if el.attr.attributes[constants.kProjectResolverIgnore] then
        el.attr.attributes[constants.kProjectResolverIgnore] = ''
        return el
      end

      if el.target then
        local resolvedHref = resolveProjectPath(el.target)
        if resolvedHref then
          el.target = resolvedHref
          return el
        end
      end
    end
  }
end


-- resourcefiles.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

function resource_files() 
  return {
    -- TODO: discover resource files
    -- Note that currently even if we discover resourceFiles in markdown they don't 
    -- actually register for site preview b/c we don't actually re-render html
    -- files for preview if they are newer than the source files. we may need to
    -- record discovered resource files in some sort of index in order to work 
    -- around this
    Image = function(el)
      local targetPath = el.src
      if not targetPath:match('^https?:') and not targetPath:match('^data:') then
        -- don't include this resource if it is a URL, data file or some not file path
        if pandoc.path.is_relative(targetPath) then 
          local inputDir = pandoc.path.directory(quarto.doc.input_file)
          targetPath = pandoc.path.join({inputDir, el.src})
        end
        -- FIXME shouldn't we be using targetPath here?
        recordFileResource(el.src)
      end
    end,
  }
end

-- function to record a file resource
function recordFileResource(res)
  quarto_global_state.results.resourceFiles:insert(res)
end


-- results.lua
-- Copyright (C) 2020-2022 Posit Software, PBC


local function resultsFile()
  return pandoc.utils.stringify(param("results-file"))
end

-- write results
function write_results()
  return {
    Pandoc = function(doc)
      local jsonResults = quarto.json.encode(quarto_global_state.results)
      local rfile = io.open(resultsFile(), "w")
      if rfile then
        rfile:write(jsonResults)
        rfile:close()
      else
        warn('Error writing LUA results file')
      end
    end
  }
end

-- shiny.lua
-- Copyright (C) 2020-2023 Posit Software, PBC

function server_shiny()
  if not param("is-shiny-python", false) then
    return {}
  end

  -- get python exec
  local pythonExec = param("shiny-python-exec", { "python" })

  -- Try calling `pandoc.pipe('shiny', ...)` and if it fails, print a message
  -- about installing shiny.
  local function callPythonShiny(args)
    -- build command and args
    local command = pythonExec[1]
    tprepend(args, { "-m", "shiny" })
    if #pythonExec > 1 then
      tprepend(args, tslice(pythonExec, 2, #pythonExec))
    end

    local res
    local status, err = pcall(
      function()
        res = pandoc.pipe(command, args, "")
      end
    )

    if not status then
      print(err)
      error(
        "Error running command 'shiny " ..
        table.concat(args, " ") ..
        "'. Please make sure the 'shiny' Python package is installed."
      )
      os.exit(1)
    end

    return res
  end


  local function getShinyDeps()
    local depJson = callPythonShiny(
      { "get-shiny-deps" }
    )

    local deps = quarto.json.decode(depJson)
    return deps
  end


  local codeCells = {
    schema_version = 1,
    cells = {},
    html_file = ""
  }

  return {
    Div = function(divEl)
      if not divEl.attr.classes:includes("cell") then
        return el
      end

      -- Start the context as nil and then set it when we hit a relevant Python
      -- code block. (We don't want to interfere with other types of code
      -- blocks.)
      local context = nil

      local res = _quarto.traverser(divEl, {
        CodeBlock = function(el)
          if el.attr.classes:includes("python") and el.attr.classes:includes("cell-code") then

            context = divEl.attr.attributes["context"] or "default"

            -- Translate the context names to ones that are used by the backend
            -- which writes out the app file.
            if context == "default" then
              context = { "ui", "server" }
            elseif context == "ui" then
              context = { "ui" }
            elseif context == "setup" then
              context = { "ui", "server-setup" }
            else
              error(
                'Invalid context: "' .. context ..
                '". Valid context types are "default", "ui", and "setup".'
              )
            end

            context = pandoc.List(context)

            table.insert(
              codeCells.cells,
              { context = context, classes = el.attr.classes, text = el.text }
            )
          end
        end,
        Div = function(el)
          -- In the HTML output, only include cell-output for ui cells.
          -- `context` will be non-nil only if there's a CodeBlock in the
          -- wrapper div which has gone through the CodeBlock function above.
          if context ~= nil
            and not context:includes("ui")
            and el.attr.classes:includes("cell-output") then
              return {}
          end
        end
      })

      return res
    end,

    Pandoc = function(doc)
      codeCells["html_file"] = pandoc.path.split_extension(
        pandoc.path.filename(quarto.doc.output_file)
      ) .. ".html"

      -- Get the shiny dependency placeholder and add it to the document.
      local baseDeps = getShinyDeps()
      for idx, dep in ipairs(baseDeps) do
        quarto.doc.add_html_dependency(dep)
      end

      -- Write the code cells to a temporary file.
      local codeCellsOutfile = pandoc.path.split_extension(quarto.doc.output_file) .. "-cells.tmp.json"
      local file = io.open(codeCellsOutfile, "w")
      if file == nil then
        error("Error opening file: " .. codeCellsOutfile .. " for writing.")
      end
      file:write(quarto.json.encode(codeCells))
      file:close()

      -- Convert the json file to app.py by calling `shiny convert-cells`.
      local appOutfile = pandoc.path.join({
        pandoc.path.directory(quarto.doc.output_file),
        "app.py"
      });
      callPythonShiny(
        { "cells-to-app", codeCellsOutfile, appOutfile }
      )

      -- TODO: Add option to keep file for debugging.
      os.remove(codeCellsOutfile)
    end

  }

end
-- shortcodes-handlers.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- handlers process shortcode into either a list of inlines or into a list of blocks
   
local function shortcodeMetatable(scriptFile) 
  return {
    -- https://www.lua.org/manual/5.3/manual.html#6.1
    assert = assert,
    collectgarbage = collectgarbage,
    dofile = dofile,
    error = error,
    getmetatable = getmetatable,
    ipairs = ipairs,
    load = load,
    loadfile = loadfile,
    next = next,
    pairs = pairs,
    pcall = pcall,
    print = print,
    rawequal = rawequal,
    rawget = rawget,
    rawlen = rawlen,
    rawset = rawset,
    select = select,
    setmetatable = setmetatable,
    tonumber = tonumber,
    tostring = tostring,
    type = type,
    _VERSION = _VERSION,
    xpcall = xpcall,
    coroutine = coroutine,
    require = require,
    package = package,
    string = string,
    utf8 = utf8,
    table = table,
    math = math,
    io = io,
---@diagnostic disable-next-line: undefined-global
    file = file,
    os = os,
    debug = debug,
    -- https://pandoc.org/lua-filters.html
    FORMAT = FORMAT,
    PANDOC_READER_OPTIONS = PANDOC_READER_OPTIONS,
    PANDOC_WRITER_OPTIONS = PANDOC_WRITER_OPTIONS,
    PANDOC_VERSION = PANDOC_VERSION,
    PANDOC_API_VERSION = PANDOC_API_VERSION,
    PANDOC_SCRIPT_FILE = scriptFile,
    PANDOC_STATE = PANDOC_STATE,
    pandoc = pandoc,
    lpeg = lpeg,
    re = re,
    -- quarto functions
    quarto = quarto
  }
end

local handlers = {}

local read_arg = quarto.shortcode.read_arg

function initShortcodeHandlers()

  -- user provided handlers
  local shortcodeFiles = pandoc.List(param("shortcodes", {}))
  for _,shortcodeFile in ipairs(shortcodeFiles) do
    local env = setmetatable({}, {__index = shortcodeMetatable(shortcodeFile)})
    _quarto.withScriptFile(shortcodeFile, function()
      local chunk, err = loadfile(shortcodeFile, "bt", env)
      if chunk ~= nil and not err then
        local result = chunk()
        if result then
          for k,v in pairs(result) do
            handlers[k] = {
              file = shortcodeFile,
              handle = v
            }
          end
        else
          for k,v in pairs(env) do
            handlers[k] = {
              file = shortcodeFile,
              handle = v
            }
          end
        end
      else
        fail(err)
      end
    end)
  end

  local function handle_contents(args)
    local data = {
      type = "contents-shortcode",
      payload = {
        id = read_arg(args)
      }
    }
    flags.has_contents_shortcode = true
    return { pandoc.RawInline('quarto-internal', quarto.json.encode(data)) }
  end

  local function handle_brand(args, _kwargs, _meta, _raw_args, context)
    local brand = require("modules/brand/brand")
    local brandCommand = read_arg(args, 1)

    local warn_bad_brand_command = function()
      warn("Unknown brand command " .. brandCommand .. " specified in a brand shortcode.")
      return quarto.shortcode.error_output("brand", args, context)
    end

    local add_leading_slash = function(path)
      if path:match '^https?:' or path[1] == "/" then
        return path
      end
      return "/" .. path
    end

    if brandCommand == "color" then 
      local brandMode = 'light'
      if #args > 2 then
        brandMode = read_arg(args, 3) or brandMode
      end
      local color_name = read_arg(args, 2)
      local color_value = brand.get_color(brandMode, color_name)
      if color_value == nil then
        return warn_bad_brand_command()
      else
        return pandoc.Inlines { pandoc.Str(color_value) }
      end
    end

    if brandCommand == "logo" then
      local logoName = read_arg(args, 2)
      local brandMode = 'both'
      if #args > 2 then
        brandMode = read_arg(args, 3) or brandMode
      end
      local lightLogo, darkLogo
      if brandMode == 'light' or brandMode == 'both' then
        lightLogo = brand.get_logo('light', logoName) or brand.get_logo('dark', logoName)
        if lightLogo then
          if type(lightLogo) ~= "table" then
            warn("unexpected light logo type: " .. type(lightLogo))
            return warn_bad_brand_command()
          end
          if type(lightLogo.path) ~= "string" then
            warn("unexpected light logo path type: " .. type(lightLogo.path))
            return warn_bad_brand_command()
          end
        end
      end
      if brandMode == 'dark' or brandMode == 'both' then
        -- fall back to light logo only if explicit dark logo or dark mode is enabled
        darkLogo = brand.get_logo('dark', logoName) or 
          ((brandMode == 'dark' or brand.has_mode('dark')) and brand.get_logo('light', logoName))
        if darkLogo then
          if type(darkLogo) ~= "table" then
            warn("unexpected dark logo type: " .. type(darkLogo))
            return warn_bad_brand_command()
          end
          if type(darkLogo.path) ~= "string" then
            warn("unexpected dark logo path type: " .. type(darkLogo.path))
            return warn_bad_brand_command()
          end
        end
      end
      if context == "text" then
        -- 'both' would not make sense here
        return lightLogo and lightLogo.path or darkLogo and darkLogo.path
      end
      local images = {}
      if lightLogo then
        local classes = brandMode == 'both' and {"light-content"} or {}
        table.insert(images, pandoc.Image(pandoc.Inlines {}, add_leading_slash(lightLogo.path), "",
          pandoc.Attr("", classes, {alt = lightLogo.alt})))
      end
      if darkLogo then
        local classes = brandMode == 'both' and {"dark-content"} or {}
        table.insert(images, pandoc.Image(pandoc.Inlines {}, add_leading_slash(darkLogo.path), "",
          pandoc.Attr("", classes, {alt = darkLogo.alt})))
      end
      if context == "block" then
        return pandoc.Blocks(images)
      elseif context == "inline" then
        return pandoc.Inlines(images)
      else
        warn("unexpected context for logo shortcode: " .. context)
        return warn_bad_brand_command()
      end
    end

    return warn_bad_brand_command()
  end

  -- built in handlers (these override any user handlers)
  handlers['meta'] = { handle = handleMeta }
  handlers['var'] = { handle = handleVars }
  handlers['env'] = { handle = handleEnv }
  handlers['pagebreak'] = { handle = handlePagebreak }
  handlers['brand'] = { handle = handle_brand }
  handlers['contents'] = { handle = handle_contents }
end

function handlerForShortcode(shortCode)
  return handlers[shortCode.name]
end

-- Implements reading values from envrionment variables
function handleEnv(args, _kwargs, _meta, _raw_args, context)
  if #args > 0 then
    -- the args are the var name
    local varName = read_arg(args)
    local defaultValue = read_arg(args, 2)

    -- read the environment variable
    local envValue = varName and os.getenv(varName) or defaultValue
    if envValue ~= nil then
      return { pandoc.Str(envValue) }  
    else 
      warn("Unknown variable " .. varName .. " specified in an env Shortcode.")
      return quarto.shortcode.error_output("env", args, context)
    end
  else
    -- no args, we can't do anything
    return nil
  end
end

-- Implements reading values from document metadata
-- as {{< meta title >}}
-- or {{< meta key.subkey.subkey >}}
-- This only supports emitting simple types (not arrays or maps)
function handleMeta(args, _kwargs, _meta, _raw_args, context) 
  if #args > 0 then
    -- the args are the var name
    local varName = read_arg(args) or ""

    -- strip quotes if present
    -- works around the real bug that we don't have
    -- great control over quoting in shortcode params
    -- see https://github.com/quarto-dev/quarto-cli/issues/7882
    if varName:sub(1,1) == '"' and varName:sub(-1) == '"' then
      varName = varName:sub(2,-2)
    elseif varName:sub(1,1) == "'" and varName:sub(-1) == "'" then
      varName = varName:sub(2,-2)
    end

    -- read the option value
    local optionValue = option(varName, nil)
    if optionValue == nil then
      warn("Unknown meta key " .. varName .. " specified in a metadata Shortcode.")
      return { pandoc.Strong(pandoc.Inlines {pandoc.Str("?meta:" .. varName)}) } 
    end

    if context == "block" then
      return processValueInBlockContext(optionValue, varName, "meta")
    elseif context == "inline" then
      return processValue(optionValue, varName, "meta")
    elseif context == "text" then
      -- As a special case, we treat the result of using
      --
      -- key2: '`Str "Something *with* a _line_ break\n\nI want to preserve"`{=pandoc-native}'
      --
      -- differently to allow users to specify precisely the
      -- string they want to use.
      if type(optionValue) == "table" and #optionValue == 1 and optionValue[1].t == "Str" then
        return optionValue[1].text
      elseif pandoc.utils.type(optionValue) == "Inlines" then
        return pandoc.utils.stringify(optionValue)
      else
        local blocks = pandoc.Blocks(optionValue)
        return pandoc.write(pandoc.Pandoc(blocks), "markdown")
      end
    else
      internal_error("Unknown context " .. context)
      return nil
    end
  else
    -- no args, we can't do anything
    return nil
  end
end

-- Implements reading variables from quarto vars file
-- as {{< var title >}}
-- or {{< var key.subkey.subkey >}}
-- This only supports emitting simple types (not arrays or maps)
function handleVars(args, _kwargs, _meta, _raw_args, context) 
  if #args > 0 then
    -- the args are the var name
    local varName = read_arg(args)
    
    -- read the option value
    local varValue = var(varName, nil)
    if varValue ~= nil then
      return processValue(varValue, varName, "var")
    else 
      warn("Unknown var " .. varName .. " specified in a var shortcode.")
      return quarto.shortcode.error_output("var", args, context)
    end

  else
    -- no args, we can't do anything
    return nil
  end
end

function processValue(val, name, t)    
  if type(val) == "table" then
    if #val == 0 then
      return { pandoc.Str( "") }
    elseif pandoc.utils.type(val) == "Inlines" then
      return val
    elseif pandoc.utils.type(val) == "Blocks" then
      return pandoc.utils.blocks_to_inlines(val)
    elseif pandoc.utils.type(val) == "List" and #val == 1 then
      return processValue(val[1], name, t)
    else
      warn("Unsupported type '" .. pandoc.utils.type(val)  .. "' for key " .. name .. " in a " .. t .. " shortcode.")
      return { pandoc.Strong(pandoc.Inlines { pandoc.Str("?invalid " .. t .. " type:" .. name) } ) }
    end
  else 
    return { pandoc.Str( tostring(val) ) }
  end
end

function processValueInBlockContext(val, name, t)    
  if type(val) == "table" then
    if #val == 0 then
      return { pandoc.Str( "") }
    end
    local pt = pandoc.utils.type(val)
    if pt == "Inlines" or pt == "Blocks" then
      return val
    elseif pt == "List" and #val == 1 then
      return processValueInBlockContext(val[1], name, t)
    else
      warn("Unsupported type '" .. pandoc.utils.type(val)  .. "' for key " .. name .. " in a " .. t .. " shortcode.")
      return { pandoc.Strong(pandoc.Inlines { pandoc.Str("?invalid " .. t .. " type:" .. name) } ) }
    end
  else 
    return { pandoc.Str( tostring(val) ) }
  end
end


function handlePagebreak()
 
  local pagebreak = {
    epub = '<p style="page-break-after: always;"> </p>',
    html = '<div style="page-break-after: always;"></div>',
    latex = '\\newpage{}',
    ooxml = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>',
    odt = '<text:p text:style-name="Pagebreak"/>',
    context = '\\page',
    typst = '#pagebreak()'
  }

  if FORMAT == 'docx' then
    return pandoc.RawBlock('openxml', pagebreak.ooxml)
  elseif FORMAT == 'pptx' then
    return {}
  elseif FORMAT:match 'latex' then
    return pandoc.RawBlock('tex', pagebreak.latex)
  elseif FORMAT:match 'odt' then
    return pandoc.RawBlock('opendocument', pagebreak.odt)
  elseif FORMAT == 'typst' then
    return pandoc.RawBlock('typst', pagebreak.typst)
  elseif FORMAT:match 'html.*' then
    return pandoc.RawBlock('html', pagebreak.html)
  elseif FORMAT:match 'epub' then
    return pandoc.RawBlock('html', pagebreak.epub)
  elseif FORMAT:match 'context' then
    return pandoc.RawBlock('context', pagebreak.context)
  else
    -- fall back to insert a form feed character
    return pandoc.Para( pandoc.Inlines { pandoc.Str '\f'} )
  end

end
-- table-classes.lua
-- Copyright (C) 2020-2023 Posit Software, PBC

-- handle classes to pass to `<table>` element
function table_classes()

  local function process_table(tbl, normalized_classes)
    -- now, forward classes from float to table
    -- ensure that classes are appended (do not want to rewrite and wipe out any existing)
    tbl.classes:extend(normalized_classes)
    -- if we have a `sm` table class then we need to add the `small` class
    -- and if we have a `small` class then we need to add the `table-sm` class
    if tcontains(normalized_classes, "table-sm") then
      tbl.classes:insert("small")
    elseif tcontains(normalized_classes, "small") then
      tbl.classes:insert("table-sm")
    end

    return tbl
  end

  -- recognized Bootstrap table classes
  local table_bootstrap_nm = {
    "primary", "secondary", "success", "danger", "warning", "info", "light", "dark",
    "striped", "hover", "active", "bordered", "borderless", "sm",
    "responsive", "responsive-sm", "responsive-md", "responsive-lg", "responsive-xl", "responsive-xxl"
  }

  -- determine if we have any supplied classes, these should always begin with a `.` and
  -- consist of alphanumeric characters
  local function normalize_class(x)
    if tcontains(table_bootstrap_nm, x) then
      return "table-" .. x
    else
      return x
    end
  end

  -- the treatment of Table and FloatRefTarget is
  -- slightly non-uniform because captions are stored slightly differently
  -- in either case. Cursed code follows...
  return {
    Table = function(tbl)
      -- determine if we have any supplied classes, these should always begin with a `.` and
      -- consist of alphanumeric characters
      local caption = tbl.caption.long[#tbl.caption.long]
      local caption_parsed, attr = parseTableCaption(pandoc.utils.blocks_to_inlines({caption}))
      tbl.classes = tbl.classes:map(normalize_class)
      local normalized_classes = attr.classes:map(normalize_class)

      process_table(tbl, normalized_classes)

      attr.classes = pandoc.List()
      tbl.caption.long[#tbl.caption.long] = pandoc.Plain(createTableCaption(caption_parsed, attr))
      if #quarto.utils.as_inlines(tbl.caption.long) == 0 then
        tbl.caption.long = pandoc.Blocks({})
      end
      return tbl
    end,
    FloatRefTarget = function(float)
      local kind = ref_type_from_float(float)
      if kind ~= "tbl" then
        return nil
      end
      if float.content == nil then
        return nil
      end

      if (float.caption_long == nil or 
          float.caption_long.content == nil or 
          #float.caption_long.content < 1) then
        return nil
      end

      local caption_content = float.caption_long.content
      local caption_parsed, attr = parseTableCaption(caption_content)
      local unnormalized_classes = float.classes
      tappend(unnormalized_classes, attr.classes)
      local normalized_classes = unnormalized_classes:map(normalize_class)

      if float.content.t == "Table" then
        float.content = process_table(float.content, normalized_classes)
      else
        float.content = _quarto.ast.walk(float.content, {
          traverse = "topdown",
          FloatRefTarget = function()
            return nil, false -- do not descend into subfloats
          end,
          Table = function(tbl)
            return process_table(tbl, normalized_classes)
          end
        })
      end

      attr.classes = pandoc.List()
      float.caption_long = pandoc.Plain(createTableCaption(caption_parsed, attr))
      return float
    end
  }

end
-- table-captions.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

local patterns = require("modules/patterns")

function table_captions()
  local kTblCap = "tbl-cap"
  local kTblSubCap = "tbl-subcap"
  return {
    Div = function(el)
      if tcontains(el.attr.classes, "cell") then
        -- extract table attributes
        local tblCap = extractTblCapAttrib(el, kTblCap)
        local tblSubCap = extractTblCapAttrib(el, kTblSubCap, true)
        if not (tblCap or hasTableRef(el)) then
          return
        end
        if not (tblCap or tblSubCap) then
          return
        end
        local tables = countTables(el)
        if tables <= 0 then
          return
        end
          
        -- special case: knitr::kable will generate a \begin{tabular} without
        -- a \begin{table} wrapper -- put the wrapper in here if need be
        if _quarto.format.isLatexOutput() then
          el = _quarto.ast.walk(el, {
            RawBlock = function(raw)
              if _quarto.format.isRawLatex(raw) then
                local tabular_match, tabular_pattern = _quarto.modules.patterns.match_in_list_of_patterns(raw.text, _quarto.patterns.latexTabularEnvPatterns)
                if tabular_match then 
                  local table_match, _ = _quarto.modules.patterns.match_in_list_of_patterns(raw.text, _quarto.patterns.latexTableEnvPatterns)
                  if not table_match then
                    raw.text = raw.text:gsub(
                      _quarto.modules.patterns.combine_patterns(tabular_pattern),
                      "\\begin{table}\n\\centering\n%1%2%3\n\\end{table}\n",
                      1)
                    return raw
                  end
                end
              end
            end
          })
        end

        -- compute all captions and labels
        local label = el.attr.identifier
        local mainCaption, tblCaptions, mainLabel, tblLabels = table_captionsAndLabels(
          label,
          tables,
          tblCap,
          tblSubCap
        )              
        -- apply captions and label
        el.attr.identifier = mainLabel
        if mainCaption then
          el.content:insert(pandoc.Para(mainCaption))
        end
        if #tblCaptions > 0 then
          el = applyTableCaptions(el, tblCaptions, tblLabels)
        end
        return el
      end
    end
  }

end

function table_captionsAndLabels(label, tables, tblCap, tblSubCap)
  
  local mainCaption = nil
  local tblCaptions = pandoc.List()
  local mainLabel = ""
  local tblLabels = pandoc.List()

  -- case: no subcaps (no main caption or label, apply caption(s) to tables)
  if not tblSubCap then
    -- case: single table (no label interpolation)
    if tables == 1 then
      tblCaptions:insert(markdownToInlines(tblCap[1]))
      tblLabels:insert(label)
    -- case: single caption (apply to entire panel)
    elseif #tblCap == 1 then
      mainCaption = tblCap[1]
      mainLabel = label
    -- case: multiple tables (label interpolation)
    else
      for i=1,tables do
        if i <= #tblCap then
          tblCaptions:insert(markdownToInlines(tblCap[i]))
          if #label > 0 then
            tblLabels:insert(label .. "-" .. tostring(i))
          else
            tblLabels:insert("")
          end
        end
      end
    end
  
  -- case: subcaps
  else
    mainLabel = label
    if mainLabel == "" then
      mainLabel = anonymousTblId()
    end
    if tblCap then
      mainCaption = markdownToInlines(tblCap[1])
    else
      mainCaption = noCaption()
    end
    for i=1,tables do
      if tblSubCap and i <= #tblSubCap and tblSubCap[i] ~= "" then
        tblCaptions:insert(markdownToInlines(tblSubCap[i]))
      else
        tblCaptions:insert(pandoc.List())
      end
      if #mainLabel > 0 then
        tblLabels:insert(mainLabel .. "-" .. tostring(i))
      else
        tblLabels:insert("")
      end
    end
  end

  return mainCaption, tblCaptions, mainLabel, tblLabels

end

function applyTableCaptions(el, tblCaptions, tblLabels)
  local idx = 1
  return _quarto.ast.walk(el, {
    Table = function(el)
      if idx <= #tblLabels then
        local cap = pandoc.Inlines({})
        if #tblCaptions[idx] > 0 then
          cap:extend(tblCaptions[idx])
          cap:insert(pandoc.Space())
        end
        if #tblLabels[idx] > 0 and tblLabels[idx]:match("^tbl%-") then
          cap:insert(pandoc.Str("{#" .. tblLabels[idx] .. "}"))
        end
        idx = idx + 1
        el.caption.long = pandoc.Blocks{pandoc.Plain(cap)}
        return el
      end
    end,
    RawBlock = function(raw)
      if idx <= #tblLabels then
        -- (1) if there is no caption at all then populate it from tblCaptions[idx]
        -- (assuming there is one, might not be in case of empty subcaps)
        -- (2) Append the tblLabels[idx] to whatever caption is there
        if hasRawHtmlTable(raw) then
          -- html table patterns
          local tablePattern = patterns.html_table
          local captionPattern = patterns.html_table_caption
          -- insert caption if there is none
          local beginCaption, caption = raw.text:match(captionPattern)
          if not beginCaption then
            raw.text = raw.text:gsub(tablePattern, "%1" .. "<caption></caption>" .. "%2%3", 1)
          end
          -- apply table caption and label
          local beginCaption, captionText, endCaption = raw.text:match(captionPattern)
          if #tblCaptions[idx] > 0 then
            captionText = stringEscape(tblCaptions[idx], "html")
          end
          if #tblLabels[idx] > 0 then
            captionText = captionText .. " {#" .. tblLabels[idx] .. "}"
          end
          raw.text = raw.text:gsub(captionPattern, "%1" .. captionText:gsub("%%", "%%%%") .. "%3", 1)
          idx = idx + 1
        elseif hasRawLatexTable(raw) then
          local matched_env, pattern_env = _quarto.modules.patterns.match_in_list_of_patterns(raw.text, _quarto.patterns.latexAllTableEnvPatterns)
          if matched_env then
              local combined_pattern = _quarto.modules.patterns.combine_patterns(pattern_env)
              raw.text = applyLatexTableCaption(raw.text, tblCaptions[idx], tblLabels[idx], combined_pattern)
          end
          idx = idx + 1
        elseif hasPagedHtmlTable(raw) then
          if #tblCaptions[idx] > 0 then
            local captionText = stringEscape(tblCaptions[idx], "html")
            if #tblLabels[idx] > 0 then
              captionText = captionText .. " {#" .. tblLabels[idx] .. "}"
            end
            local pattern = "(<div data[-]pagedtable=\"false\">)"
            -- we don't have a table to insert a caption to, so we'll wrap the caption with a div and the right class instead
            local replacement = "%1 <div class=\"table-caption\"><caption>" .. captionText:gsub("%%", "%%%%") .. "</caption></div>"
            raw.text = raw.text:gsub(pattern, replacement)
          end
          idx = idx + 1
        end
       
        return raw
      end
    end
  })
end


function applyLatexTableCaption(latex, tblCaption, tblLabel, tablePattern)
  local latex_caption_match, _ = _quarto.modules.patterns.match_in_list_of_patterns(latex, _quarto.patterns.latexCaptionPatterns)
  -- insert caption if there is none
  if not latex_caption_match then
    latex = latex:gsub(tablePattern, "%1" .. "\n\\caption{ }\\tabularnewline\n" .. "%2%3", 1)
  end
  -- caption will be matched
  latex_caption_match, latex_caption_pattern = _quarto.modules.patterns.match_in_list_of_patterns(latex, _quarto.patterns.latexCaptionPatterns)
  -- apply table caption and label
  if not latex_caption_match then
    -- should never happen as we add the caption command to latex string above
    -- added to make linter happy too.
    fatal("Internal Error: \\caption not correctly added in " .. latex)
  else
    -- caption text is second element of matched pattern
    local captionText = latex_caption_match[2]
    if #tblCaption > 0 then
      captionText = stringEscape(tblCaption, "latex")
    end
    if #tblLabel > 0 then
      captionText = captionText .. " {#" .. tblLabel .. "}"
    end
    assert(captionText)
    latex = latex:gsub(_quarto.modules.patterns.combine_patterns(latex_caption_pattern), "%1" .. captionText:gsub("%%", "%%%%") .. "%3", 1)
    return latex
  end
end


function extractTblCapAttrib(el, name, subcap)
  local value = attribute(el, name, nil)
  if value then
    if startsWith(value, "[") then
      value = pandoc.List(quarto.json.decode(value))
    elseif subcap and (value == "true") then
      value = pandoc.List({ "" })
    else
      value = pandoc.List({ value })
    end
    -- el.attr.attributes[name] = nil
    return value
  end
  return nil
end
-- table-colwidth.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- local kTblColwidths = require("modules/constants").kTblColWidths

-- takes a tblColwidths attribute value (including nil) and returns an table
-- of pandoc AST colwidths 
-- local function tblColwidthValues(tbl, tblColwidths)
--   local function noWidths(ncol)
--     local widths = {}
--     for i = 1,ncol do
--       widths[i] = 0
--     end
--     return widths
--   end

--   -- determine the widths (using any passed param as the default)
--   if tblColwidths == nil then
--     tblColwidths = param(kTblColwidths, true)
--   elseif tblColwidths == "true" then
--     tblColwidths = true
--   elseif tblColwidths == "false" then
--     tblColwidths = false
--   end

--   -- take appropriate action
--   if tblColwidths == "auto" then
--     local foundLink = false
--     _quarto.ast.walk(tbl, {
--       Link = function(el)
--         foundLink = true
--       end
--     })
--     if foundLink then
--       return noWidths(#tbl.colspecs)
--     else
--       return nil
--     end
--   elseif tblColwidths == true then
--     return nil
--   elseif tblColwidths == false then
--     return noWidths(#tbl.colspecs)
--   else
--     if type(tblColwidths) == "string" then
--       -- provide array brackets if necessary
--       if tblColwidths:find("[", 1, true) ~= 1 then
--         tblColwidths = '[' .. tblColwidths .. ']'
--       end
--       -- decode array
--       tblColwidths = quarto.json.decode(tblColwidths)
--     end
--     if type(tblColwidths) == "table" then
--       local totalWidth = 0
--       local widths = {}
--       for i = 1,#tbl.colspecs do
--         if i <= #tblColwidths then
--           widths[i] = tblColwidths[i]
--         else
--           widths[i] = tblColwidths[#tblColwidths]
--         end
--         totalWidth = totalWidth + widths[i]
--       end

--       -- normalize to 100 if the total is > 100
--       if totalWidth > 100 then
--         for i=1,#widths do 
--           widths[i] = round((widths[i]/totalWidth) * 100, 1)
--         end
--       end

--       -- convert all widths to decimal
--       for i=1,#widths do 
--         widths[i] = round(widths[i] / 100, 2)
--       end

--       return widths
--     else
--       warn("Unexpected tbl-colwidths value: " .. tblColwidths)
--       return nil
--     end
--   end
-- end

-- propagate cell level tbl-colwidths to tables
-- function table_colwidth_cell(float)
--   if ref_type_from_float(float) ~= "tbl" then
--     return
--   end
      
--   local tblColwidths = float.attributes[kTblColwidths]
--   local function process_table(tbl)
--     tbl.attributes[kTblColwidths] = tblColwidths
--     return tbl
--   end
--   if tblColwidths ~= nil then
--     float.attributes[kTblColwidths] = nil
--     if float.content.t == "Table" then
--       float.content = process_table(float.content)
--     else            
--       float.content = _quarto.ast.walk(float.content, {
--         Table = process_table
--       })
--     end
--   end
-- end

-- handle tbl-colwidth
-- function table_colwidth()
--   return {
   
--     Table = function(tbl)
     
--       -- see if we have a tbl-colwidths attribute
--       local tblColwidths = nil
--       if tbl.caption.long ~= nil and #tbl.caption.long > 0 then
--         local caption =  tbl.caption.long[#tbl.caption.long]
        
--         local tblCaption, attr = parseTableCaption(pandoc.utils.blocks_to_inlines({caption}))
--         tblColwidths = attr.attributes[kTblColwidths]
--         if tblColwidths ~= nil then
--           attr.attributes[kTblColwidths] = nil
--           tbl.caption.long[#tbl.caption.long] = pandoc.Plain(createTableCaption(tblCaption, attr))
--         end
--       end

--       -- failing that check for an ambient attribute provided by a cell
--       if tblColwidths == nil then
--         tblColwidths = tbl.attr.attributes[kTblColwidths]
--       end
--       tbl.attr.attributes[kTblColwidths] = nil

--       -- if we found a quarto-postprocess attribute,
--       -- that means this was a table parsed from html and
--       -- we don't need to do the fixups
--       if tbl.attr.attributes["quarto-postprocess"] then
--         return nil
--       end
      
--       -- realize values and apply them
--       local colwidthValues = tblColwidthValues(tbl, tblColwidths)
--       if colwidthValues ~= nil then
--         local simpleTbl = pandoc.utils.to_simple_table(tbl)
--         simpleTbl.widths = colwidthValues
--         return pandoc.utils.from_simple_table(simpleTbl)
--       end
--     end
--   }

-- end

-- table-rawhtml.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

-- flextable outputs consecutive html blocks so we merge them
-- back together here so they can be processed by our raw table
-- caption handling

local patterns = require("modules/patterns")

function table_merge_raw_html()
  if not _quarto.format.isHtmlOutput() then
    return {}
  end

  return {
    Blocks = function(blocks)
      local pending_raw = pandoc.List()
      local next_element_idx = 1
      for _, el in ipairs(blocks) do
        if _quarto.format.isRawHtml(el) and
           el.text:find(patterns.html_table_tag_name) then
          pending_raw:insert(el.text)
        else
          if next(pending_raw) then
            blocks[next_element_idx] =
              pandoc.RawBlock("html", table.concat(pending_raw, "\n"))
            pending_raw = pandoc.List()
            next_element_idx = next_element_idx + 1
          end
          blocks[next_element_idx] = el
          next_element_idx = next_element_idx + 1
        end
      end
      if #pending_raw > 0 then
        blocks[next_element_idx] =
          pandoc.RawBlock("html", table.concat(pending_raw, "\n"))
        next_element_idx = next_element_idx + 1
      end
      for i = next_element_idx, #blocks do
        blocks[i] = nil
      end
      return blocks
    end
  }
end

-- re-emits GT's CSS with lower specificity
function respecifyGtCSS(text)
  local s, e, v = text:find('<div id="([a-z]+)"')
  -- if gt does not emit a div, do nothing
  if v == nil then
    return text
  end
  return text:gsub("\n#" .. v, "\n:where(#" .. v .. ")")
end

function table_respecify_gt_css()
  return {
    RawBlock = function(el)
      if hasGtHtmlTable(el) then
        el.text = respecifyGtCSS(el.text)
      end
      return el
    end
  }
end
-- theorems.lua
-- Copyright (C) 2021-2022 Posit Software, PBC


function quarto_pre_theorems() 
  
  return {
    Div = function(el)
      if has_theorem_ref(el) then
        local capEl = el.content[1]
        if capEl ~= nil and capEl.t == 'Header' then
          capEl.attr.classes:insert("unnumbered")
          capEl.attr.classes:insert("unlisted")
        end
      end
      return el
    end,
  }
end
-- latexenv.lua
-- Copyright (C) 2023 Posit Software, PBC

_quarto.ast.add_handler({

  -- empty table so this handler is only called programmatically
  class_name = {},

  -- the name of the ast node, used as a key in extended ast filter tables
  ast_name = "LatexEnvironment",

  kind = "Block",

  parse = function(div)
    -- luacov: disable
    internal_error()
    -- luacov: enable
  end,

  slots = { "content" },

  constructor = function(tbl)
    tbl.content = pandoc.Div(tbl.content or {})
    return tbl
  end
})

_quarto.ast.add_renderer("LatexEnvironment", function(_) return true end,
function(env)
  local result = pandoc.Blocks({})
  result:insert(latexBeginEnv(env.name, env.pos))
  result:extend(env.content.content or env.content) 
  result:insert(pandoc.RawBlock("latex-merge", "\\end{" .. env.name .. "}%"))
  return result
end)
-- latexcmd.lua
-- Copyright (C) 2023 Posit Software, PBC

_quarto.ast.add_handler({
  class_name = {},
  ast_name = "LatexInlineCommand",
  kind = "Inline",
  -- luacov: disable
  parse = function() internal_error() end,
  -- luacov: enable
  slots = { "arg", "opt_arg" },
  constructor = function(tbl) return tbl end
})

_quarto.ast.add_handler({
  class_name = {},
  ast_name = "LatexBlockCommand",
  kind = "Block",
  -- luacov: disable
  parse = function() internal_error() end,
  -- luacov: enable
  slots = { "arg", "opt_arg" },
  constructor = function(tbl) return tbl end
})

_quarto.ast.add_renderer("LatexInlineCommand", function(_) return true end,
function(cmd)
  local result = pandoc.Inlines({})
  result:insert(pandoc.RawInline("latex", "\\" .. cmd.name))
  local opt_arg = cmd.opt_arg
  if opt_arg then
    result:insert(pandoc.RawInline("latex", "["))
    if opt_arg.content then
      result:extend(opt_arg.content)
    else
      result:insert(opt_arg)
    end
    result:insert(pandoc.RawInline("latex", "]"))
  end
  local arg = cmd.arg
  if arg then
    result:insert(pandoc.RawInline("latex", "{"))
    if arg.content then
      result:extend(arg.content)
    else
      result:insert(arg)
    end
    result:insert(pandoc.RawInline("latex", "}"))
  end
  return result
end)

_quarto.ast.add_renderer("LatexBlockCommand", function(_) return true end,
function(cmd)
  local result = pandoc.Blocks({})
  local preamble = pandoc.Inlines({})
  local postamble = pandoc.Inlines({})
  preamble:insert(pandoc.RawInline("latex", "\\" .. cmd.name))
  local opt_arg = cmd.opt_arg
  if opt_arg then
    preamble:insert(pandoc.RawInline("latex", "["))
    if opt_arg.content then
      preamble:extend(opt_arg.content)
    else
      preamble:insert(opt_arg)
    end
    preamble:insert(pandoc.RawInline("latex", "]"))
  end
  preamble:insert(pandoc.RawInline("latex", "{"))
  result:insert(pandoc.Plain(preamble))
  local arg = cmd.arg
  if arg then
    local pt = pandoc.utils.type(arg)
    if pt == "Blocks" then
      result:extend(arg)
    elseif pt == "Block" then
      if arg.content then
        result:extend(arg.content)
      else
        result:insert(arg)
      end
    else
      -- luacov: disable
      fail_and_ask_for_bug_report("Unexpected type for LatexBlockCommand arg: " .. pt)
      return nil
      -- luacov: enable
    end
  end
  postamble:insert(pandoc.RawInline("latex", "}"))
  result:insert(pandoc.Plain(postamble))
  return result
end)
-- htmltag.lua
-- Copyright (C) 2023 Posit Software, PBC

_quarto.ast.add_handler({

  -- empty table so this handler is only called programmatically
  class_name = {},

  -- the name of the ast node, used as a key in extended ast filter tables
  ast_name = "HtmlTag",

  -- float crossrefs are always blocks
  kind = "Block",

  parse = function(div)
    -- luacov: disable
    internal_error()
    -- luacov: enable
  end,

  slots = { "content" },

  constructor = function(tbl)
    if tbl.attr then
      tbl.identifier = tbl.attr.identifier
      tbl.classes = tbl.attr.classes
      tbl.attributes = as_plain_table(tbl.attr.attributes)
      tbl.attr = nil
    end
    tbl.classes = tbl.classes or {}
    tbl.attributes = tbl.attributes or {}
    tbl.identifier = tbl.identifier or ""
    tbl.content = pandoc.Div(tbl.content or {})
    return tbl
  end
})

_quarto.ast.add_renderer("HtmlTag", function(_) return true end,
function(tag)
  local div = pandoc.Blocks({})
  local result = div
  local result_attrs = {
    class = table.concat(tag.classes, " "),
  }
  if tag.identifier ~= nil and tag.identifier ~= "" then
    result_attrs.id = tag.identifier
  end
  for k, v in pairs(tag.attributes) do
    result_attrs[k] = v
  end
  local attr_string = {}
  for k, v in spairs(result_attrs) do
    table.insert(attr_string, k .. "=\"" .. html_escape(v, true) .. "\"")
  end
  result:insert(pandoc.RawBlock("html", "<" .. tag.name .. " " .. table.concat(attr_string, " ") .. ">"))
  result:extend(tag.content.content) 
  result:insert(pandoc.RawBlock("html", "</" .. tag.name .. ">"))

  return div
end)
-- shortcodes.lua
-- Copyright (C) 2020-2022 Posit Software, PBC

local shortcode_lpeg = require("lpegshortcode")

_quarto.ast.add_handler({
  class_name = { "quarto-shortcode__" },

  ast_name = "Shortcode",

  kind = "Inline",

  parse = function(span)
    local inner_content = pandoc.Inlines({})

    span.content = span.content:filter(function(el)
      return el.t == "Span"
    end)
    local shortcode_content = span.content:map(function(el)
      if not el.classes:includes("quarto-shortcode__-param") then
        -- luacov: disable
        quarto.log.output(el)
        fatal("Unexpected span in a shortcode parse")
        -- luacov: enable
      end

      -- is it a recursive shortcode?
      local custom_data, t, kind = _quarto.ast.resolve_custom_data(el)
      if custom_data ~= nil then
        local inner_index = #inner_content+1
        inner_content:insert(custom_data)
        return {
          type = "shortcode",
          value = inner_index
        }
      end

      -- is it a plain value?
      if el.attributes["data-key"] == nil and el.attributes["data-value"] then
        return {
          type = "param",
          value = el.attributes["data-value"]
        }
      end

      -- it is a key value.
      if el.attributes["data-key"] then
        local key = el.attributes["data-key"]
        local value = el.attributes["data-value"]
        if value == nil then
          -- it's a recursive value
          value = el.content[1]
          local inner_index = #inner_content+1
          inner_content:insert(value)
          return {
            type = "key-value-shortcode",
            key = key,
            value = inner_index
          }
        else
          -- it's a plain value
          return {
            type = "key-value",
            key = key,
            value = value
          }
        end
      else
        -- luacov: disable
        quarto.log.output(el)
        fatal("Unexpected span in a shortcode parse")
        -- luacov: enable
      end
    end)
    local name = shortcode_content:remove(1)
    if name.type == "param" then
      name = name.value
    end

    local node = _quarto.ast.create_custom_node_scaffold("Shortcode", "Inline")
    node.content = pandoc.Inlines(inner_content:map(function(el)
      return pandoc.Span({el})
    end))
    local tbl = {
      __quarto_custom_node = node,
      name = name,
      unparsed_content = span.attributes["data-raw"],
      params = shortcode_content
    }
    
    return quarto.Shortcode(tbl)
  end,

  render = function(node)
    quarto.log.output(node)
    -- luacov: disable
    internal_error()
    -- luacov: enable
  end,

  constructor = function(tbl)
    return tbl, false
  end,
})

local function handle_shortcode(shortcode_tbl, node, context)
  local name
  if type(shortcode_tbl.name) ~= "string" then
    -- this is a recursive shortcode call,
    -- name is a number that indexes into the node's content
    -- to get the shortcode node to call.

    -- typically, shortcodes are resolved in a typewise traversal
    -- which is bottom up, so we should be seeing resolved shortcode
    -- content here. But in unusual cases, we might be calling
    -- this function outside of a filter, in which case
    -- we need to handle this explicitly

    if type(shortcode_tbl.name) ~= "number" then
      -- luacov: disable
      quarto.log.output(shortcode_tbl.name)
      fatal("Unexpected shortcode name type " .. type(shortcode_tbl.name))
      -- luacov: enable
    end

    local shortcode_node = node.content[shortcode_tbl.name]
    -- are we already resolved?
    for i, v in ipairs(shortcode_node.content) do
      local custom_data, t, kind = _quarto.ast.resolve_custom_data(v)
      if custom_data ~= nil then
        if t ~= "Shortcode" then
          -- luacov: disable
          quarto.log.output(t)
          fatal("Unexpected shortcode content type " .. tostring(t))
          -- luacov: enable
        end
        -- we are not resolved, so resolve
        shortcode_node.content[i] = handle_shortcode(custom_data, v, context)
      end
    end

    name = pandoc.utils.stringify(shortcode_node)
    -- TODO check that this returns a string as it should
  else 
    name = shortcode_tbl.name
  end

  local args = {}
  local raw_args = {}

  for _, v in ipairs(shortcode_tbl.params) do
    if v.type == "key-value" then
      table.insert(args, { name = v.key, value = v.value })
      table.insert(raw_args, v.value)
    elseif v.type == "key-value-shortcode" then
      local result = handle_shortcode(v.value, node, context)
      table.insert(args, { name = v.key, value = result })
      table.insert(raw_args, result)
    elseif v.type == "shortcode" then
      local shortcode_node = node.content[v.value]
      local custom_data, t, kind = _quarto.ast.resolve_custom_data(shortcode_node)
      local result
      if custom_data == nil then
        result = pandoc.utils.stringify(shortcode_node)
      elseif t ~= "Shortcode" then
        -- luacov: disable
        quarto.log.output(custom_data)
        quarto.log.output(t)
        fatal("Unexpected shortcode content type " .. tostring(t))
        -- luacov: enable
      else
        local result = handle_shortcode(custom_data, shortcode_node, context)
        result = pandoc.utils.stringify(result)
      end
      table.insert(args, { value = result })
      table.insert(raw_args, result)
    elseif v.type == "param" then
      table.insert(args, { value = v.value })
      table.insert(raw_args, v.value)
    else
      -- luacov: disable
      quarto.log.output(v)
      fatal("Unexpected shortcode param type " .. tostring(v.type))
      -- luacov: enable
    end
  end

  local shortcode_struct = {
    args = args,
    raw_args = raw_args,
    name = name,
    unparsed_content = shortcode_tbl.unparsed_content
  }

  local handler = handlerForShortcode(shortcode_struct)
  if handler == nil then
    return nil, shortcode_struct
  end

  return callShortcodeHandler(handler, shortcode_struct, context), shortcode_struct
end

local _shortcodes_filter = nil
function process_shortcodes(content)
  return _quarto.ast.walk(content, _shortcodes_filter)
end

function shortcodes_filter()

  local code_shortcode = shortcode_lpeg.make_shortcode_parser({
    escaped = function(s) return "{{<" .. s .. ">}}" end,
    string = function(s) return { value = s } end,
    keyvalue = function(k, r, v) 
      return { name = k, value = v } 
    end,
    shortcode = function(open, space, lst, close)
      local name = table.remove(lst, 1).value
      local raw_args = {}
      for _, v in ipairs(lst) do
        table.insert(raw_args, v.value)
      end
      local shortcode_struct = {
        args = lst,
        raw_args = raw_args,
        name = name
      }
      local handler = handlerForShortcode(shortcode_struct)
      if handler == nil then
        local strs = {}
        table.insert(strs, open)
        table.insert(strs, space)
        table.insert(strs, name)
        for _, v in ipairs(lst) do
          if type(v) == "string" then
            table.insert(strs, v)
          else
            if v.name then
              table.insert(strs, v.name .. "=" .. v.value)
            else
              table.insert(strs, v.value)
            end
          end
        end
        table.insert(strs, close)
        return table.concat(strs, "")
      end
      local result = callShortcodeHandler(handler, shortcode_struct, "text")
      return pandoc.utils.stringify(result) 
    end, 
  })
  local function apply_code_shortcode(text)
    return shortcode_lpeg.wrap_lpeg_match(code_shortcode, text) or text
  end

  local filter

  local block_handler = function(node)
    if (node.t == "Para" or node.t == "Plain") and #node.content == 1 then
      node = node.content[1]
    end
    local custom_data, t, kind = _quarto.ast.resolve_custom_data(node)
    if t ~= "Shortcode" then
      return nil
    end
    local result, struct = handle_shortcode(custom_data, node, "block")
    return _quarto.ast.walk(shortcodeResultAsBlocks(result, struct.name, custom_data), filter)
  end

  local inline_handler = function(custom_data, node)
    local result, struct = handle_shortcode(custom_data, node, "inline")
    local r1 = shortcodeResultAsInlines(result, struct.name, custom_data)
    local r2 = _quarto.ast.walk(r1, filter)
    return r2
  end

  local code_handler = function(el)
    -- don't process shortcodes in code output from engines
    -- (anything in an engine processed code block was actually
    --  proccessed by the engine, so should be printed as is)
    if el.attr and el.attr.classes:includes("cell-code") then
      return
    end

    -- don't process shortcodes if they are explicitly turned off
    if el.attr and el.attr.attributes["shortcodes"] == "false" then
      return
    end

    el.text = apply_code_shortcode(el.text)
    return el
  end

  local attr_handler = function(el)
    for k,v in pairs(el.attributes) do
      if type(v) == "string" then
        el.attributes[k] = apply_code_shortcode(v)
      end
    end
    return el
  end

  filter = {
    Pandoc = function(doc)
      -- first walk them in block context
      doc = _quarto.ast.walk(doc, {
        Para = block_handler,
        Plain = block_handler,
        Code = code_handler,
        RawBlock = code_handler,
        CodeBlock = code_handler,
        Header = attr_handler,
        Div = function(el)
          if el.classes:includes("quarto-markdown-envelope-contents") then
            return nil
          end
          if el.classes:includes("quarto-shortcode__-escaped") then
            return pandoc.Plain(pandoc.Str(el.attributes["data-value"]))
          else
            el = attr_handler(el)
            return el
          end
        end,
      })

      doc = _quarto.ast.walk(doc, {
        Shortcode = inline_handler,
        RawInline = code_handler,
        Image = function(el)
          el = attr_handler(el)
          el.src = apply_code_shortcode(el.src)
          return el
        end,
        Link = function(el)
          el = attr_handler(el)
          el.target = apply_code_shortcode(el.target)
          return el
        end,
        Span = function(el)
          if el.classes:includes("quarto-markdown-envelope-contents") then
            return nil
          end
          if el.classes:includes("quarto-shortcode__-escaped") then
            return pandoc.Str(el.attributes["data-value"])
          else
            el = attr_handler(el)
            return el
          end
        end,
       })
      return doc
    end
  }

  _shortcodes_filter = filter
  return filter
end

-- helper function to read metadata options
local function readMetadata(value)
  -- We were previously coercing everything to lists of inlines when possible
  -- which made for some simpler treatment of values in meta, but it also
  -- meant that reading meta here was different than reading meta in filters
  -- 
  -- This is now just returning the raw meta value and not coercing it, so 
  -- users will have to be more thoughtful (or just use pandoc.utils.stringify)
  --
  -- Additionally, this used to return an empty list of inlines but now
  -- it returns nil for an unset value
  return option(value, nil)
end

-- call a handler w/ args & kwargs
function callShortcodeHandler(handler, shortCode, context)
  local args = pandoc.List()
  local kwargs = setmetatable({}, { __index = function () return pandoc.Inlines({}) end })
  for _,arg in ipairs(shortCode.args) do
    if arg.name then
      kwargs[arg.name] = arg.value
    else
      args:insert(arg.value)
    end
  end
  local meta = setmetatable({}, { __index = function(t, i) 
    return readMetadata(i)
  end})
  local callback = function()
    return handler.handle(args, kwargs, meta, shortCode.raw_args, context)
  end
  -- set the script file path, if present
  if handler.file ~= nil then
    return _quarto.withScriptFile(handler.file, callback)
  else
    return callback()
  end
end

function shortcodeResultAsInlines(result, name, shortcode_tbl)
  if result == nil then
    warn("Shortcode '" .. name .. "' not found")
    local result = pandoc.Inlines({pandoc.RawInline(FORMAT, shortcode_tbl.unparsed_content)})
    return result
  end
  local type = quarto.utils.type(result)
  if type == "Inlines" then
    return result
  elseif type == "Blocks" then
    return pandoc.utils.blocks_to_inlines(result, { pandoc.Space() })
  elseif type == "string" then
    return pandoc.Inlines( { pandoc.Str(result) })
  elseif tisarray(result) then
    local items = pandoc.List(result)
    local inlines = items:filter(isInlineEl)
    if #inlines > 0 then
      return pandoc.Inlines(inlines)
    else
      local blocks = items:filter(isBlockEl)
      return pandoc.utils.blocks_to_inlines(blocks, { pandoc.Space() })
    end
  elseif isInlineEl(result) then
    return pandoc.Inlines( { result })
  elseif isBlockEl(result) then
    return pandoc.utils.blocks_to_inlines( { result }, { pandoc.Space() })
  else
    -- luacov: disable
    error("Unexpected result from shortcode " .. name .. "")
    quarto.log.output(result)
    fatal("This is a bug in the shortcode. If this is a quarto shortcode, please report it at https://github.com/quarto-dev/quarto-cli")
    -- luacov: enable
  end
end
  
function shortcodeResultAsBlocks(result, name, shortcode_tbl)
  if result == nil then
    if name ~= 'include' then
      warn("Shortcode '" .. name .. "' not found")
    end
    return pandoc.Blocks({pandoc.RawBlock(FORMAT, shortcode_tbl.unparsed_content)})
  end
  local type = quarto.utils.type(result)
  if type == "Blocks" then
    return result
  elseif type == "Inlines" then
    return pandoc.Blocks( {pandoc.Para(result) }) -- why not a plain?
  elseif type == "string" then
    return pandoc.Blocks( {pandoc.Para({pandoc.Str(result)})} ) -- why not a plain?
  elseif tisarray(result) then
    local items = pandoc.List(result)
    local blocks = items:filter(isBlockEl)
    if #blocks > 0 then
      return pandoc.Blocks(blocks)
    else
      local inlines = items:filter(isInlineEl)
      return pandoc.Blocks({pandoc.Para(inlines)}) -- why not a plain?
    end
  elseif isBlockEl(result) then
    return pandoc.Blocks( { result } )
  elseif isInlineEl(result) then
    return pandoc.Blocks( {pandoc.Para( {result} ) }) -- why not a plain?
  else
    -- luacov: disable
    error("Unexpected result from shortcode " .. name .. "")
    quarto.log.output(result)
    fatal("This is a bug in the shortcode. If this is a quarto shortcode, please report it at https://github.com/quarto-dev/quarto-cli")
    -- luacov: enable
  end
end
-- content-hidden.lua
-- Copyright (C) 2022 Posit Software, PBC


local constants = require("modules/constants")

local kConditions = pandoc.List({
  constants.kWhenMeta, constants.kUnlessMeta, 
  constants.kWhenFormat, constants.kUnlessFormat, 
  constants.kWhenProfile, constants.kUnlessProfile
})

function is_visible(node)
  local profiles = pandoc.List(param("quarto_profile", {}))
  local match = propertiesMatch(node.condition, profiles)
  if node.behavior == constants.kContentVisible then
    return match
  elseif node.behavior == constants.kContentHidden then
    return not match
  else
    -- luacov: disable
    fatal("Internal Error: invalid behavior for conditional block: " .. node.behavior)
    return false
    -- luacov: enable
  end
end

_quarto.ast.add_handler({
  class_name = { constants.kContentVisible, constants.kContentHidden },
  
  ast_name = "ConditionalBlock",

  kind = "Block",

  parse = function(div)
    local behavior = div.classes:find(constants.kContentVisible) or div.classes:find(constants.kContentHidden)
    local condition = pandoc.List({})
    local remaining_attributes = pandoc.List({})
    for i, v in ipairs(div.attributes) do
      if kConditions:find(v[1]) ~= nil then
        condition:insert(v)
      else
        remaining_attributes:insert(v)
      end
    end
    div.attributes = remaining_attributes
    div.classes = div.classes:filter(function(k) return k ~= constants.kContentVisible and k ~= constants.kContentHidden end)

    return quarto.ConditionalBlock({
      node = div,
      behavior = behavior,
      condition = condition
    })
  end,

  slots = { "node" },

  render = function(node)
    local visible = is_visible(node)
    if visible then
      local el = node.node
      -- Handle case where slot content was transformed (e.g., Div → FloatRefTarget → Table)
      if is_regular_node(el, "Div") then
        -- Defensive: parse() already stripped visibility attrs (lines 46-47), so this is
        -- typically a no-op. Kept as safety net in case future code adds attrs between
        -- parse and render. See issue #13992 investigation for AST trace evidence.
        clearHiddenVisibleAttributes(el)
        return el.content
      else
        -- Slot was transformed to another type (Table, etc.)
        -- Return the rendered element wrapped in Blocks
        return pandoc.Blocks({el})
      end
    else
      return {}
    end
  end,

  constructor = function(tbl)
    local result = {
      node = tbl.node,
      original_node = tbl.node:clone(), -- keep it around in case filters need to inspect it
      behavior = tbl.behavior,
      condition = pandoc.List({})
    };
    for i, v in ipairs(tbl.condition or {}) do
      if kConditions:find(v[1]) == nil then
        -- luacov: disable
        error("Ignoring invalid condition in conditional block: " .. v[1])
        -- luacov: enable
      else
        if result.condition[v[1]] == nil then
          result.condition[v[1]] = pandoc.List({})
        end
        result.condition[v[1]]:insert(v[2])
      end
    end

    if not is_visible(result) then
      -- if the block is not visible, clear out the content
      -- before filters are run on document
      result.node.content = {}
    end

    flags.has_conditional_content = true
    return result
  end,

})

local _content_hidden_meta = nil

-- we capture a copy of meta here for convenience;
-- 
function content_hidden_meta(meta)
  -- return {
  --   Meta = function(meta)
  -- The call to `pandoc.Meta` ensures that we hold a copy.
  _content_hidden_meta = pandoc.Meta(meta)
  --   end
  -- }
end

local function get_meta(key)
  local obj = _content_hidden_meta
  for _, k in ipairs(key) do
    if obj == nil then
      return nil
    end
    obj = obj[k]
  end
  return obj
end

function content_hidden()
  local profiles = pandoc.List(param("quarto_profile", {}))
  return {
    -- Div = handleHiddenVisible(profiles),
    CodeBlock = handleHiddenVisible(profiles),
    Span = handleHiddenVisible(profiles)
  }
end

function handleHiddenVisible(profiles)
  return function(el)
    local visible
    if el.attr.classes:find(constants.kContentVisible) then
      visible = propertiesMatch(el.attributes, profiles)
      clearHiddenVisibleAttributes(el)
    elseif el.attr.classes:find(constants.kContentHidden) then
      visible = not propertiesMatch(el.attributes, profiles)
      clearHiddenVisibleAttributes(el)
    else
      return el
    end
    -- this is only called on spans and codeblocks, so here we keep the scaffolding element
    -- as opposed to in the Div where we return the inlined content
    if visible then
      return el
    else
      return {}
    end
  end
end

-- "properties" here will come either from "conditions", in the case of a custom AST node
-- or from the attributes of the element itself in the case of spans or codeblocks
function propertiesMatch(properties, profiles)
  local function check_meta(v)
    local v = split(v, ".") or { v }
    local r = get_meta(v)
    return type(r) == "boolean" and r
  end
  local function check_profile(value)
    return profiles:includes(value)
  end
  local function check_property(key, f)
    local v = properties[key]
    if type(v) == "string" then
      return f(v)
    elseif type(v) == "table" then
      local r = false
      for _, value in ipairs(v) do
        r = r or f(value)
      end
      return r
    else
      -- luacov: disable
      error("Invalid value type for condition: " .. type(v))
      -- luacov: enable
    end
  end
  local tests = {
    { constants.kWhenMeta, check_meta, false },
    { constants.kUnlessMeta, check_meta, true },
    { constants.kWhenFormat, quarto.format.is_format, false },
    { constants.kUnlessFormat, quarto.format.is_format, true },
    { constants.kWhenProfile, check_profile, false },
    { constants.kUnlessProfile, check_profile, true }
  }
  local match = true
  for _, test in ipairs(tests) do
    local key = test[1]
    local f = test[2]
    local invert = test[3]
    if properties[key] ~= nil then
      match = match and (invert ~= check_property(key, f))
    end
  end
  return match
end

function clearHiddenVisibleAttributes(el)
  el.attributes[constants.kUnlessFormat] = nil
  el.attributes[constants.kWhenFormat] = nil
  el.attributes[constants.kUnlessProfile] = nil
  el.attributes[constants.kWhenProfile] = nil
  el.attr.classes = removeClass(el.attr.classes, constants.kContentVisible)
  el.attr.classes = removeClass(el.attr.classes, constants.kContentHidden)
end
-- decoratedcodeblock.lua
-- Copyright (C) 2020-2023 Posit Software, PBC

-- A custom AST node for decorated code blocks
-- so we can render the decorations in the right order

_quarto.ast.add_handler({
  -- decorated code blocks can't be represented as divs in markdown, they can
  -- only be constructed directly in Lua
  class_name = {},

  -- the name of the ast node, used as a key in extended ast filter tables
  ast_name = "DecoratedCodeBlock",

  -- DecoratedCodeblocks will be rendered as blocks
  kind = "Block",

  slots = { "code_block" },

  -- a function that takes the div node as supplied in user markdown
  -- and returns the custom node
  parse = function(div)
    -- luacov: disable
    internal_error()
    -- luacov: enable
  end,

  constructor = function(tbl)
    return tbl
  end
})

-- default renderer
-- return the code block unadorned
-- this probably could be improved
_quarto.ast.add_renderer("DecoratedCodeBlock",
  function(_)
    return true
  end,
  function(node)
    return _quarto.ast.walk(node.code_block, {
      CodeBlock = render_folded_block
    })
  end)

-- markdown renderer
_quarto.ast.add_renderer("DecoratedCodeBlock",
  function(_)
    return _quarto.format.isMarkdownOutput()    
  end,
  function(node)
    local el = node.code_block
    -- see https://github.com/quarto-dev/quarto-cli/issues/5112
    -- 
    -- This is a narrow fix for the 1.3 regression.
    -- We still don't support listings output in markdown since that wasn't supported in 1.2 either.
    -- But that'll be done in 1.4 with crossrefs overhaul.

    if node.filename then
      -- a user filter could have replaced
      -- a single code block in a decorated code block with a list of elements,
      -- so we need to handle that.
      local blocks = quarto.utils.as_blocks(el) or pandoc.Blocks({})
      -- if we have a filename, add it as a header
      blocks:insert(1, pandoc.Plain{pandoc.Strong{pandoc.Str(node.filename)}})
      return pandoc.Div(
        blocks,
        pandoc.Attr("", {"code-with-filename"})
      )
    else
      return _quarto.ast.walk(quarto.utils.as_blocks(el), {
        CodeBlock = render_folded_block
      })
    end
  end)

  -- latex renderer
_quarto.ast.add_renderer("DecoratedCodeBlock",
  function(_)
    return _quarto.format.isLatexOutput()    
  end,
  function(node)
    -- add listing class to the code block
    -- need to walk the code block instead of assigning directly
    -- because upstream filters might have replaced the code block with
    -- more than one element
    node.code_block = _quarto.ast.walk(quarto.utils.as_blocks(node.code_block), {
      CodeBlock = function(el)
        el.attr.classes:insert("listing")
        return render_folded_block(el)
      end
    }) or node.code_block -- unneeded but the Lua analyzer doesn't know that

    -- if we are use the listings package we don't need to do anything
    -- further, otherwise generate the listing div and return it
    if not param("listings", false) then
      local listingDiv = pandoc.Div({})
      -- Adjust default float positionment for beamer (#5536)
      -- Adjust default float positionment for code blocks that request it (#12344)
      local needs_hold = _quarto.format.isBeamerOutput() or node.hold
      local position = needs_hold and "[H]" or ""
      listingDiv.content:insert(pandoc.RawBlock("latex", "\\begin{codelisting}" .. position))

      local captionContent = node.caption

      if node.filename ~= nil and captionContent ~= nil then
        -- with both filename and captionContent we need to add a colon
        local listingCaption = pandoc.Plain({pandoc.RawInline("latex", "\\caption{")})
        listingCaption.content:insert(
          pandoc.RawInline("latex", "\\texttt{" .. stringEscape(node.filename, "latex") .. "}: ")
        )
        listingCaption.content:extend(captionContent)
        listingCaption.content:insert(pandoc.RawInline("latex", "}"))
        listingDiv.content:insert(listingCaption)
      elseif node.filename ~= nil and captionContent == nil then
        local listingCaption = pandoc.Plain({pandoc.RawInline("latex", "\\caption{")})
        -- with just filename we don't add a colon
        listingCaption.content:insert(
          pandoc.RawInline("latex", "\\texttt{" .. stringEscape(node.filename, "latex") .. "}")
        )
        listingCaption.content:insert(pandoc.RawInline("latex", "}"))
        listingDiv.content:insert(listingCaption)
      elseif node.filename == nil and captionContent ~= nil then
        local listingCaption = pandoc.Plain({pandoc.RawInline("latex", "\\caption{")})
        listingCaption.content:extend(captionContent)
        listingCaption.content:insert(pandoc.RawInline("latex", "}"))
        listingDiv.content:insert(listingCaption)
      end

      -- a user filter could have replaced
      -- a single code block in a decorated code block with a list of elements,
      -- so we need to handle that.
      listingDiv.content:extend(quarto.utils.as_blocks(node.code_block) or {})
      listingDiv.content:insert(pandoc.RawBlock("latex", "\\end{codelisting}"))
      return listingDiv
    end
    return node.code_block
  end)

-- html renderer
_quarto.ast.add_renderer("DecoratedCodeBlock", 
  function(_)
    return _quarto.format.isHtmlOutput()
  end,
  function(node)
    if node.filename == nil then
      return _quarto.ast.walk(quarto.utils.as_blocks(node.code_block), {
        CodeBlock = render_folded_block
      })
    end
    local el = node.code_block
    local filenameEl
    local caption
    local classes = pandoc.List()
    filenameEl = pandoc.Div({pandoc.Plain{
      pandoc.RawInline("html", "<pre>"),
      pandoc.Strong{pandoc.Str(node.filename)},
      pandoc.RawInline("html", "</pre>")
    }}, pandoc.Attr("", {"code-with-filename-file"}))
    classes:insert("code-with-filename")

    local blocks = pandoc.Blocks({})
    if caption ~= nil then
      blocks:insert(caption)
    end
    el = _quarto.ast.walk(quarto.utils.as_blocks(el), {
      CodeBlock = render_folded_block
    }) or pandoc.Blocks({})
    if filenameEl ~= nil then
      el = _quarto.ast.walk(quarto.utils.as_blocks(el), {
        CodeBlock = function(block)
          return pandoc.Blocks({
            filenameEl,
            block
          })
        end
      }) or pandoc.Blocks({})
    end
    blocks:extend(el)

    return pandoc.Div(blocks, pandoc.Attr("", classes))
  end)
-- callout.lua
-- Copyright (C) 2021-2022 Posit Software, PBC

function _callout_main()
  local function calloutType(div)
    for _, class in ipairs(div.attr.classes) do
      if _quarto.modules.classpredicates.isCallout(class) then 
        local type = class:match("^callout%-(.*)")
        if type == nil then
          type = "none"
        end
        return type
      end
    end
    return nil
  end

  local function nameForCalloutStyle(calloutType)
    if calloutType == nil then
      return "default"
    else 
      local name = pandoc.utils.stringify(calloutType)
  
      if name:lower() == "minimal" then
        return "minimal"
      elseif name:lower() == "simple" then
        return "simple"
      else
        return "default"
      end
    end
  end

  _quarto.ast.add_handler({
    -- use either string or array of strings
    class_name = { "callout", "callout-note", "callout-warning", "callout-important", "callout-caution", "callout-tip" },
  
    -- the name of the ast node, used as a key in extended ast filter tables
    ast_name = "Callout",
  
    -- callouts will be rendered as blocks
    kind = "Block",
  
    -- a function that takes the div node as supplied in user markdown
    -- and returns the custom node
    parse = function(div)
      quarto_global_state.hasCallouts = true
      local title = string_to_quarto_ast_inlines(div.attr.attributes["title"] or "")
      if not title or #title == 0 then
        title = resolveHeadingCaption(div)
      end
      local old_attr = div.attr
      local appearanceRaw = div.attr.attributes["appearance"]
      local icon = div.attr.attributes["icon"]
      local collapse = div.attr.attributes["collapse"]
      div.attr.attributes["appearance"] = nil
      div.attr.attributes["collapse"] = nil
      div.attr.attributes["icon"] = nil
      local callout_type = calloutType(div)
      div.attr.classes = div.attr.classes:filter(function(class) return not _quarto.modules.classpredicates.isCallout(class) end)
      return quarto.Callout({
        appearance = appearanceRaw,
        title = title,
        collapse = collapse,
        content = div.content,
        icon = icon,
        type = callout_type,
        attr = old_attr,
      })
    end,
  
    -- These fields will be stored in the extended ast node
    -- and available in the object passed to the custom filters
    -- They must store Pandoc AST data. "Inline" custom nodes
    -- can store Inlines in these fields, "Block" custom nodes
    -- can store Blocks (and hence also Inlines implicitly).
    slots = { "title", "content" },
  
    constructor = function(tbl)
      quarto_global_state.hasCallouts = true
  
      local t = tbl.type
      local iconDefault = true
      local appearanceDefault = nil
      if t == "none" then
        iconDefault = false
        appearanceDefault = "simple"
      end
      local appearanceRaw = tbl.appearance
      if appearanceRaw == nil then
        appearanceRaw = option("callout-appearance", appearanceDefault)
      end
  
      local icon = tbl.icon
      if icon == nil then
        icon = option("callout-icon", iconDefault)
      elseif icon == "false" then
        icon = false
      end
  
      local appearance = nameForCalloutStyle(appearanceRaw);
      if appearance == "minimal" then
        icon = false
        appearance = "simple"
      end
      local content = pandoc.Blocks({})
      content:extend(quarto.utils.as_blocks(tbl.content))
      local title = tbl.title
      if type(title) == "string" then
        title = pandoc.Str(title)
      end
      return {
        title = title,
        collapse = tbl.collapse,
        content = content,
        appearance = appearance,
        icon = icon,
        type = t,
        attr = tbl.attr or pandoc.Attr(),
      }
    end
  })

  -- default renderer first
  _quarto.ast.add_renderer("Callout", function(_)
    return true
  end, function(node)
    node = _quarto.modules.callouts.decorate_callout_title_with_crossref(node)
    local contents = _quarto.modules.callouts.resolveCalloutContents(node, true)
    local callout = pandoc.BlockQuote(contents)
    local result = pandoc.Div(callout, pandoc.Attr(node.attr.identifier or ""))
    return result
  end)

  _quarto.ast.add_renderer("Callout", function(_)
    return _quarto.format.isHtmlOutput() and hasBootstrap()
  end, _quarto.modules.callouts.render_to_bootstrap_div)
  
  _quarto.ast.add_renderer("Callout", function(_) 
    return _quarto.format.isEpubOutput() or _quarto.format.isRevealJsOutput()
  end, function (node)
    node = _quarto.modules.callouts.decorate_callout_title_with_crossref(node)
    local title = quarto.utils.as_inlines(node.title)
    local type = node.type
    local calloutAppearance = node.appearance
    local hasIcon = node.icon
  
    if calloutAppearance == _quarto.modules.constants.kCalloutAppearanceDefault and pandoc.utils.stringify(title) == "" then
      title = _quarto.modules.callouts.displayName(type)
    end
    
    -- the body of the callout
    local calloutBody = pandoc.Div({}, pandoc.Attr("", {"callout-body"}))
  
    local imgPlaceholder = pandoc.Plain({pandoc.RawInline("html", "<i class='callout-icon'></i>")});       
    local imgDiv = pandoc.Div({imgPlaceholder}, pandoc.Attr("", {"callout-icon-container"}));
  
    -- title
    if title ~= nil and (pandoc.utils.type(title) == "string" or next(title) ~= nil) then
      local callout_title = pandoc.Div({}, pandoc.Attr("", {"callout-title"}))
      if hasIcon then
        callout_title.content:insert(imgDiv)
      end
      callout_title.content:insert(pandoc.Para(pandoc.Strong(title)))
      calloutBody.content:insert(callout_title)
    else 
      if hasIcon then
        calloutBody.content:insert(imgDiv)
      end
    end
  
    -- contents 
    local calloutContents = pandoc.Div(node.content or pandoc.Blocks({}), pandoc.Attr("", {"callout-content"}))
    calloutBody.content:insert(calloutContents)
  
    -- set attributes (including hiding icon)
    local attributes = pandoc.List({"callout"})
    if type ~= nil then
      attributes:insert("callout-" .. type)
    end
  
    if hasIcon == false then
      attributes:insert("no-icon")
    end
    if title ~= nil and (pandoc.utils.type(title) == "string" or next(title) ~= nil) then
      attributes:insert("callout-titled")
    end
    attributes:insert("callout-style-" .. calloutAppearance)
  
    local result = pandoc.Div({ calloutBody }, pandoc.Attr(node.attr.identifier or "", attributes))
    -- in revealjs or epub, if the leftover attr is non-trivial, 
    -- then we need to wrap the callout in a div (#5208, #6853)
    if node.attr.identifier ~= "" or #node.attr.classes > 0 or #node.attr.attributes > 0 then
      return pandoc.Div({ result }, node.attr)
    else
      return result
    end
  end)

  _quarto.ast.add_renderer("Callout", function(_)
    return _quarto.format.isGithubMarkdownOutput()
  end, function(callout)
    local result = pandoc.Blocks({})
    local header = "[!" .. callout.type:upper() .. "]"
    result:insert(pandoc.RawBlock("markdown", header))
    local tt = pandoc.utils.type(callout.title)
    if tt ~= "nil" then 
      result:insert(pandoc.Header(3, quarto.utils.as_inlines(callout.title)))
    end
    local content = callout.content or pandoc.Blocks({})
    local ct = pandoc.utils.type(content)
    if ct == "Block" then
      result:insert(content)
    elseif ct == "Blocks" then
      result:extend(content)
    else
      internal_error()
    end
    return pandoc.BlockQuote(result)
  end)

  local included_font_awesome = false
  local function ensure_typst_font_awesome()
    if included_font_awesome then
      return
    end
    included_font_awesome = true
    quarto.doc.include_text("in-header", "#import \"@preview/fontawesome:0.5.0\": *")
  end

  _quarto.ast.add_renderer("Callout", function(_)
    return _quarto.format.isTypstOutput()
  end, function(callout)
    ensure_typst_font_awesome()

    local callout_theme_color_map = {
      note = "primary",
      warning = "warning",
      important = "danger",
      tip = "success",
      caution = nil -- ?
    }

    local attrs = _quarto.modules.callouts.callout_attrs[callout.type]
    local background_color, icon_color, icon
    if attrs == nil then
      background_color = "white"
      icon_color = "black"
      icon = "fa-info"
    else
      background_color = "rgb(\"#" .. attrs.background_color .. "\")";
      icon_color = "rgb(\"#" .. attrs.color .. "\")";
      icon = attrs.fa_icon_typst
    end
    local brand = param("brand")
    local brandMode = param('brand-mode') or 'light'
    brand = brand and brand[brandMode]
    body_background_color = "white"
    if brand then
      local color = brand.processedData and brand.processedData.color
      if color then
        if callout_theme_color_map[callout.type] and
          color[callout_theme_color_map[callout.type]] then
          background_color =  "brand-color-background." .. callout_theme_color_map[callout.type]
          icon_color = "brand-color." .. callout_theme_color_map[callout.type]
        elseif color.background then
          local brandPercent = 15
          if brandMode == 'dark' then
            brandPercent = 50
          end
          local bkPercent = 100 - brandPercent
          background_color = 'color.mix((' .. icon_color .. ', ' .. brandPercent .. '%), (brand-color.background, ' .. bkPercent .. '%))'
        end
        if color.background then
          body_background_color = "brand-color.background"
        end
      end
    end
    -- Check if identifier has a valid crossref category
    local ref_type = refType(callout.attr.identifier)
    local category = ref_type ~= nil and crossref.categories.by_ref_type[ref_type] or nil

    -- Warn if identifier was provided but category is invalid
    if callout.attr.identifier ~= "" and category == nil then
      warn("Callout ID '" .. callout.attr.identifier .. "' has unknown reference type '" .. (ref_type or "none") .. "'. Rendering as regular callout without cross-reference support.")
    end

    -- Check if this is a margin callout (has .column-margin or .aside class)
    local is_margin = hasMarginColumn(callout.attr)
    local alignment, dy, shift
    if is_margin then
      alignment = callout.attr.attributes and callout.attr.attributes["alignment"] or "baseline"
      dy = callout.attr.attributes and callout.attr.attributes["dy"] or "0pt"
      shift = callout.attr.attributes and callout.attr.attributes["shift"] or "auto"
    end

    if category == nil then
      local typst_callout_basic = _quarto.format.typst.function_call("callout", {
        { "body", _quarto.format.typst.as_typst_content(callout.content) },
        { "title", _quarto.format.typst.as_typst_content(
          (not quarto.utils.is_empty_node(callout.title) and callout.title) or
          pandoc.Plain(_quarto.modules.callouts.displayName(callout.type))
        )},
        { "background_color", pandoc.RawInline("typst", background_color) },
        { "icon_color", pandoc.RawInline("typst", icon_color) },
        { "icon", pandoc.RawInline("typst", callout.icon == false and "none" or ("" .. icon .. "()"))},
        { "body_background_color", pandoc.RawInline("typst", body_background_color)}
      })

      -- Wrap in #note() for margin placement if needed
      if is_margin then
        local result = pandoc.Blocks({})
        result:insert(pandoc.RawBlock("typst",
          '#note(alignment: "' .. alignment .. '", dy: ' .. dy ..
          ', shift: ' .. _quarto.format.typst.format_shift_param(shift) .. ', counter: none)['))
        result:extend(quarto.utils.as_blocks(typst_callout_basic))
        result:insert(pandoc.RawBlock("typst", ']'))
        result:insert(pandoc.RawBlock("typst", '\n\n'))
        return result
      end

      return typst_callout_basic
    end

    local typst_callout = _quarto.format.typst.function_call("callout", {
      { "body", _quarto.format.typst.as_typst_content(callout.content) },
      { "title", _quarto.format.typst.as_typst_content(callout.title, "inlines")
       },
      { "background_color", pandoc.RawInline("typst", background_color) },
      { "icon_color", pandoc.RawInline("typst", icon_color) },
      { "icon", pandoc.RawInline("typst", callout.icon == false and "none" or ("" .. icon .. "()"))},
      { "body_background_color", pandoc.RawInline("typst", body_background_color)}
    })

    -- For crossref callouts in margin, wrap the entire figure in #note()
    if is_margin then
      local typst_figure = make_typst_figure {
        content = typst_callout,
        caption_location = "top",
        caption = pandoc.Plain(pandoc.Str("")),
        kind = "quarto-callout-" .. _quarto.modules.callouts.displayName(callout.type),
        supplement = param("crossref-" .. callout.type .. "-prefix") or category.name,
        numbering = nil,  -- handled by callout-numbering in template
        identifier = callout.attr.identifier
      }
      local result = pandoc.Blocks({})
      result:insert(pandoc.RawBlock("typst",
        '#note(alignment: "' .. alignment .. '", dy: ' .. dy ..
        ', shift: ' .. _quarto.format.typst.format_shift_param(shift) .. ', counter: none)['))
      result:extend(quarto.utils.as_blocks(typst_figure))
      result:insert(pandoc.RawBlock("typst", ']'))
      result:insert(pandoc.RawBlock("typst", '\n\n'))
      return result
    end

    return make_typst_figure {
      content = typst_callout,
      caption_location = "top",
      caption = pandoc.Plain(pandoc.Str("")),
      kind = "quarto-callout-" .. _quarto.modules.callouts.displayName(callout.type),
      supplement = param("crossref-" .. callout.type .. "-prefix") or category.name,
      numbering = nil,  -- handled by callout-numbering in template
      identifier = callout.attr.identifier
    }
  end)

  _quarto.ast.add_renderer("Callout", function(_)
    return _quarto.format.isDocxOutput()
  end, function(callout)
    return calloutDocx(callout)
  end)
end
_callout_main()

function docx_callout_and_table_fixup() 
  if not _quarto.format.isDocxOutput() then
    return {}
  end

  -- Attempts to detect whether this element is a code cell
  -- whose output is a table
  local function isCodeCellTable(el) 
    local isTable = false
    _quarto.ast.walk(el, {
      Div = function(div)
        if div.attr.classes:find_if(_quarto.modules.classpredicates.isCodeCellDisplay) then
          _quarto.ast.walk(div, {
            Table = function(tbl)
              isTable = true
            end
          })
        end
      end
    })
    return isTable
  end

  local function isCodeCellFigure(el)
    local isFigure = false
    _quarto.ast.walk(el, {
      Div = function(div)
        if div.attr.classes:find_if(_quarto.modules.classpredicates.isCodeCellDisplay) then
          if (isFigureDiv(div)) then
            isFigure = true
          elseif div.content and #div.content > 0 then 
            isFigure = discoverFigure(div.content[1], true) ~= nil
          end
        end
      end
    })
    return isFigure
  end

  return {
  
    -- Insert paragraphs between consecutive callouts or tables for docx
    Blocks = function(blocks)
      local lastWasCallout = false
      local lastWasTableOrFigure = false
      local newBlocks = pandoc.Blocks({})
      for i,el in ipairs(blocks) do 
        -- determine what this block is
        local isCallout = is_custom_node(el, "Callout")
        local isTableOrFigure = is_custom_node(el, "FloatRefTarget") or el.t == "Table" or isFigureDiv(el) or (discoverFigure(el, true) ~= nil)
        local isCodeBlock = el.t == "CodeBlock"

        -- Determine whether this is a code cell that outputs a table
        local isCodeCell = is_regular_node(el, "Div") and el.attr.classes:find_if(_quarto.modules.classpredicates.isCodeCell)
        if isCodeCell and (isCodeCellTable(el) or isCodeCellFigure(el)) then 
          isTableOrFigure = true
        end
        
        -- insert spacer if appropriate
        local insertSpacer = false
        if isCallout and (lastWasCallout or lastWasTableOrFigure) then
          insertSpacer = true
        end
        if isCodeBlock and lastWasCallout then
          insertSpacer = true
        end
        if isTableOrFigure and lastWasTableOrFigure then
          insertSpacer = true
        end

        if insertSpacer then
          newBlocks:insert(pandoc.Para(stringToInlines(" ")))
        end

        -- always insert
        newBlocks:insert(el)

        -- record last state
        lastWasCallout = isCallout
        lastWasTableOrFigure = isTableOrFigure
      end

      if #newBlocks > #blocks then
        return newBlocks
      else
        return nil
      end
    end

  }
end

function crossref_callouts()
  return {
    Callout = function(callout)
      local type = refType(callout.attr.identifier)
      if type == nil or not is_valid_ref_type(type) then
        return nil
      end
      local label = callout.attr.identifier
      local title = quarto.utils.as_blocks(callout.title)
      callout.order = add_crossref(label, type, title)
      return callout
    end
  }
end
-- panel-tabset.lua
-- Copyright (C) 2022 Posit Software, PBC

---@alias quarto.Tab { content:pandoc.Blocks, title:pandoc.Inlines }

--[[
Create a Tab AST node (represented as a Lua table)
]]
---@param params { content:nil|pandoc.Blocks|string, title:pandoc.Inlines|string, active:nil|boolean }
---@return quarto.Tab
quarto.Tab = function(params)
  local content
  if type(params.content) == "string" then
    local content_string = params.content
    ---@cast content_string string
    content = pandoc.Blocks(pandoc.read(content_string, "markdown").blocks)
  else
    content = params.content or pandoc.Blocks({})
  end
  local active = false
  if type(params.active) == "boolean" then
    active = params.active
  end

  return {
    active = active,
    content = content,
    title = pandoc.Inlines(params.title)
  }
end

local function render_quarto_tab(tbl, tabset)
  local content = quarto.utils.as_blocks(tbl.content)
  local title = quarto.utils.as_inlines(tbl.title)
  local inner_content = pandoc.List()
  local attr = pandoc.Attr("", {}, {})
  if tbl.active then
    attr.classes:insert("active")
  end
  inner_content:insert(pandoc.Header(tabset.level, title, attr))
  inner_content:extend(content)
  return pandoc.Div(inner_content)
end

function parse_tabset_contents(div)
  local heading = div.content:find_if(function(el) return el.t == "Header" end)
  if heading ~= nil then
    -- note the level, then build tab buckets for content after these levels
    local level = heading.level
    local tabs = pandoc.List()
    local tab = nil
    for i=1,#div.content do 
      local el = div.content[i]
      if el.t == "Header" and el.level == level then
        tab = quarto.Tab({ 
          title = el.content, 
          active = el.attr.classes:includes("active") 
        })
        tabs:insert(tab)
      elseif tab ~= nil then
        tab.content:insert(el)
      end
    end
    return tabs, level
  else
    return nil
  end
end

local tabsetidx = 1

function render_tabset(attr, tabs, renderer)
  -- create a unique id for the tabset
  local tabsetid = "tabset-" .. tabsetidx
  tabsetidx = tabsetidx + 1

  -- init tab navigation 
  local nav = pandoc.List()
  nav:insert(pandoc.RawInline('html', '<ul ' .. renderer.ulAttribs(tabsetid) .. '>'))

  -- init tab panes
  local panes = pandoc.Div({}, attr)
  panes.attr.classes = attr.classes:map(function(class) 
    if class == "panel-tabset" then
      return "tab-content" 
    else
      return class
    end
  end)
  local has_active = tabs:find_if(function(tab) 
    local heading = tab.content[1]
    return heading and heading.classes:includes("active")
  end)
  local function is_active(tab, i)
    if has_active then
      local heading = tab.content[1]
      return heading and heading.classes:includes("active")
    end
    return i == 1
  end
  -- cache actives here because the populate loop mutates the tabs
  local actives = tabs:map(function(tab, i) return is_active(tab, i) end)
  
  -- populate
  for i=1,#tabs do
    -- alias tab and heading
    local tab = tabs[i]
    local heading = tab.content[1]
    tab.content:remove(1)

    -- tab id
    local tabid = tabsetid .. "-" .. i
    local tablinkid = tabid .. "-tab" -- FIXME unused from before?

    -- navigation
    nav:insert(pandoc.RawInline('html', '<li ' .. renderer.liAttribs() .. '>'))
    nav:insert(pandoc.RawInline('html', '<a ' .. renderer.liLinkAttribs(tabid, actives[i]) .. '>'))
    nav:extend(heading.content)
    nav:insert(pandoc.RawInline('html', '</a></li>'))

    -- pane
    local paneAttr = renderer.paneAttribs(tabid, actives[i], heading.attr)
    local pane = pandoc.Div({}, paneAttr)
    pane.content:extend(tab.content)
    panes.content:insert(pane)
  end

  -- end tab navigation
  nav:insert(pandoc.RawInline('html', '</ul>'))

  -- return tabset
  return pandoc.Div({
    pandoc.Plain(nav),
    panes
  }, attr:clone())
end

_quarto.ast.add_handler({
  -- use either string or array of strings
  class_name = { "panel-tabset" },

  -- the name of the ast node, used as a key in extended ast filter tables
  ast_name = "Tabset",

  kind = "Block",

  constructor = function(params)
    local node = _quarto.ast.create_custom_node_scaffold("Tabset", "Block")
    if params.tabs == nil then
      warn("No tabs found in tabset. Please check that your markdown includes tab headings as appropriate.")
      params.tabs = pandoc.List()
    end

    local custom_data = {
      __quarto_custom_node = node,
      level = params.level or 2,
      attr = params.attr or pandoc.Attr("", {"panel-tabset"}),
      actives = params.tabs:map(function(tab) return tab.active end)
    }
    local outer_custom_data = custom_data

    local function make_tab_metaobject(custom_data, index)
      local forwarder = {
        content = 2 * index - 1,
        title = 2 * index
      }
      local result = {
        active = outer_custom_data.actives[index],
      }
      setmetatable(result, _quarto.ast.create_proxy_metatable(
        function(key) return forwarder[key] end,
        function(_) 
          return custom_data["__quarto_custom_node"] 
        end
      ))
      return result
    end

    local function make_tabs_metaobject(custom_data)
      local result = {
      }
      setmetatable(result, {
        __pairs = function(t)
          local l = #custom_data["__quarto_custom_node"].content // 2
          return function(t, k)
            local key = k + 1
            if key > l then
              return nil
            end
            return key, make_tab_metaobject(t, key)
          end, t, 0
        end,
        __len = function(t)
          return #custom_data["__quarto_custom_node"].content // 2
        end,
        __index = function(t, k)
          if k == "__quarto_custom_node" then
            return custom_data["__quarto_custom_node"]
          end
          if type(k) ~= "number" then
            return rawget(t, k)
          end
          local l = #custom_data["__quarto_custom_node"].content // 2
          if k < 1 or k > l then
            return nil
          end
          return make_tab_metaobject(t, k)
        end,
        __newindex = function(t, k, v)
          if type(k) ~= "number" then
            rawset(t, k, v)
            return
          end
          local tab = make_tab_metaobject(custom_data, k)
          for key, value in pairs(v) do
            tab[key] = value
          end
        end
      })
      return result
    end

    setmetatable(custom_data, {
      __index = function(t, k)
        if k ~= "tabs" then
          return rawget(t, k)
        end
        return make_tabs_metaobject(t)
      end,
      __newindex = function(t, k, v)
        if k ~= "tabs" then
          rawset(t, k, v)
          return
        end
        local tabs = make_tabs_metaobject(t)
        for key, value in pairs(v) do
          tabs[key] = value
        end
      end
    })
    custom_data.tabs = params.tabs or pandoc.List()

    return custom_data, false
  end,

  -- a function that takes the div node as supplied in user markdown
  -- and returns the custom node
  parse = function(div)
    local tabs, level = parse_tabset_contents(div)
    return quarto.Tabset({
      level = level,
      tabs = tabs,
      attr = div.attr
    })
  end,

  -- a function that renders the extendedNode into output
  render = function(node)
    local tabs = tmap(node.tabs, function(tab) return render_quarto_tab(tab, node) end)
    if hasBootstrap() then
      return render_tabset(node.attr, tabs, bootstrapTabs())
    elseif _quarto.format.isHtmlOutput() then
      return render_tabset(node.attr, tabs, tabbyTabs())
    elseif _quarto.format.isLatexOutput() or _quarto.format.isDocxOutput() or _quarto.format.isEpubOutput() or _quarto.format.isJatsOutput() then
      return pandoc.Div(render_tabset_with_l4_headings(tabs), node.attr)
    else
      print("Warning: couldn't recognize format, using default tabset rendering")
      return pandoc.Div(render_tabset_with_l4_headings(tabs), node.attr)
    end  
  end,
})

function bootstrapTabs() 
  return {
    ulAttribs = function(tabsetid)
      return 'class="nav nav-tabs" role="tablist"'
    end,
    liAttribs = function(tabid, isActive)
      return 'class="nav-item" role="presentation"'
    end,
    liLinkAttribs = function(tabid, isActive)
      local tablinkid = tabid .. "-tab"
      local active = ""
      local selected = "false"
      if isActive then
        active = " active"
        selected = "true"
      end
      return 'class="nav-link' .. active .. '" id="' .. tablinkid .. '" data-bs-toggle="tab" data-bs-target="#' .. tabid .. '" role="tab" aria-controls="' .. tabid .. '" aria-selected="' .. selected .. '" href=""'
    end,
    paneAttribs = function(tabid, isActive, headingAttribs)
      local tablinkid = tabid .. "-tab"
      local attribs = headingAttribs:clone()
      attribs.identifier = tabid
      attribs.classes:insert("tab-pane")
      if isActive then
        attribs.classes:insert("active")
      end
      attribs.attributes["role"] = "tabpanel"
      attribs.attributes["aria-labelledby"] = tablinkid
      return attribs
    end
  }
end

function tabbyTabs()
  return {
    ulAttribs = function(tabsetid)
      return 'id="' .. tabsetid .. '" class="panel-tabset-tabby"'
    end,
    liAttribs = function(tabid, isActive)
      return ''
    end,
    liLinkAttribs = function(tabid, isActive)
      local default = ""
      if isActive then
        default = "data-tabby-default "
      end
      return default .. 'href="#' .. tabid .. '"'
    end,
    paneAttribs = function(tabid, isActive, headingAttribs)
      local attribs = headingAttribs:clone()
      attribs.identifier = tabid
      return attribs
    end
  }
end

local function min(a, b)
  if a < b then
    return a
  else
    return b
  end
end

function render_tabset_with_l4_headings(tabs)
  local result = pandoc.List()
  for i=1,#tabs do
    local tab = tabs[i]
    local heading = tab.content[1]
    local level = heading.level
    tab.content:remove(1)
    local tabid = "tab-" .. i
    result:insert(pandoc.Header(min(4, level), heading.content, heading.attr))
    result:extend(tab.content)
  end
  return result
end

-- function tabsetLatex(div_content)
--   -- find the first heading in the tabset
--   local heading = div_content:find_if(function(el) return el.t == "Header" end)
--   if heading ~= nil then
--     local level = heading.level
--     if level < 4 then
--       heading.level = 4

--       for i=1,#div_content do 
--         local el = div_content[i]
--         if el.t == "Header" and el.level == level then
--           el.level = 4
--         end
--       end 
--     end
--   end

--   return div_content
-- end
-- floatreftarget.lua
-- Copyright (C) 2023 Posit Software, PBC

local drop_class = require("modules/filters").drop_class
local patterns = require("modules/patterns")

-- Track whether we've injected the Typst show rule for listing alignment
local injected_listing_align_rule = false

local function split_longtable_start(content_str)
  -- we use a hack here to split the content into params and actual content
  -- see https://github.com/quarto-dev/quarto-cli/issues/7655#issuecomment-1821181132

  -- we need to find a matching pair of braces
  -- we do this by counting the number of open braces
  
  -- we need to do this through utf8 because lua strings are not unicode-aware
  local codepoints = table.pack(utf8.codepoint(content_str, 1, #content_str))
  local function find_codepoint(start_idx, ...)
    if start_idx > #codepoints then
      return nil
    end
    local target_codepoints = table.pack(...)
    for i = start_idx, #codepoints do
      local code_point = codepoints[i]
      for _, target_codepoint in ipairs(target_codepoints) do
        if code_point == target_codepoint then
          return i, code_point
        end
      end
    end
    return nil
  end
  local function find_pair_of_braces(start_idx)
    local count = 0
    local open_brace_idx
    local next_brace_idx, code_point
    next_brace_idx = find_codepoint(start_idx, 123) -- {
    if next_brace_idx == nil then
      return nil
    end
    open_brace_idx = next_brace_idx
    next_brace_idx = next_brace_idx + 1
    count = count + 1
    while count > 0 do
      next_brace_idx, code_point = find_codepoint(next_brace_idx, 123, 125) -- {, }
      if next_brace_idx == nil then
        return nil
      end
      if code_point == 123 then
        count = count + 1
      else
        count = count - 1
      end
      next_brace_idx = next_brace_idx + 1
    end
    return open_brace_idx, next_brace_idx - 1
  end
  -- first find the start of the environment
  local start_idx, end_idx = find_pair_of_braces(1)
  if start_idx == nil then
    return nil
  end
  -- then find the start of the longtable params
  start_idx, end_idx = find_pair_of_braces(end_idx + 1)
  if start_idx == nil then
    return nil
  end
  -- now split the string
  return content_str:sub(1, end_idx), content_str:sub(end_idx + 1)
end


_quarto.ast.add_handler({

  -- empty table so this handler is only called programmatically
  class_name = {},

  -- the name of the ast node, used as a key in extended ast filter tables
  ast_name = "FloatRefTarget",

  -- generic names this custom AST node responds to
  -- this is still unimplemented
  interfaces = {"Crossref"},

  -- float reftargets are always blocks
  kind = "Block",

  parse = function(div)
    -- luacov: disable
    internal_error()
    -- luacov: enable
  end,

  slots = { "content", "caption_long", "caption_short" },

  constructor = function(tbl)
    if tbl.attr then
      tbl.identifier = tbl.attr.identifier
      tbl.classes = tbl.attr.classes
      tbl.attributes = as_plain_table(tbl.attr.attributes)
      tbl.attr = nil
    end

    tbl.attributes = pandoc.List(tbl.attributes)
    tbl.classes = pandoc.List(tbl.classes)

    return tbl
  end
})

function cap_location(obj)
  local ref
  local is_float = obj.t == "FloatRefTarget"
  
  if is_float then
    ref = ref_type_from_float(obj)
  else
    -- this is either a layout or a Pandoc Figure
    -- layouts might not have good identifiers, but they might have
    -- ref-parents
    ref = refType(obj.identifier) or refType(obj.attributes["ref-parent"] or "")
  end
  if ref == nil or crossref.categories.by_ref_type[ref] == nil then
    if obj.t == "Table" then
      ref = "tbl"
    else
      -- last resort, pretend we're a figure
      ref = "fig"
    end
  end
  local qualified_key = ref .. '-cap-location'
  local result = (
    obj.attributes[qualified_key] or
    obj.attributes['cap-location'] or
    option_as_string(qualified_key) or
    option_as_string('cap-location') or
    crossref.categories.by_ref_type[ref].caption_location)

  if result ~= "margin" and result ~= "top" and result ~= "bottom" then
    -- luacov: disable
    error("Invalid caption location for float: " .. obj.identifier .. 
      " requested " .. result .. 
      ".\nOnly 'top', 'bottom', and 'margin' are supported. Assuming 'bottom'.")
    result = "bottom"
    -- luacov: enable
  end
    
  return result
end

-- we need to expose this function for use in the docusaurus renderer
quarto.doc.crossref.cap_location = cap_location

local function get_node_from_float_and_type(float, type, filter_base)
  -- this explicit check appears necessary for the case where
  -- float.content is directly the node we want, and not a container that
  -- contains the node.
  if float.content == nil then
    return nil
  end
  if float.content.t == type then
    return float.content
  else
    local found_node = nil
    local filter = {
      traverse = "topdown",
      [type] = function(node)
        found_node = node
        return nil, false -- don't recurse
      end
    }
    if filter_base ~= nil then
      for k,v in pairs(filter_base) do
        filter[k] = v
      end
    end
    _quarto.ast.walk(float.content, filter)
    return found_node
  end
end

-- default renderer first
_quarto.ast.add_renderer("FloatRefTarget", function(_)
  return true
end, function(float)
  warn("\nEmitting a placeholder FloatRefTarget\nOutput format " .. FORMAT .. " does not currently support FloatRefTarget nodes.")
  return _quarto.ast.scaffold_element(float.content)
end)

function is_unlabeled_float(float)
  -- from src/resources/filters/common/refs.lua
  return float.identifier:match("^%a+%-539a35d47e664c97a50115a146a7f1bd%-")
end

function decorate_caption_with_crossref(float)
  if not param("enable-crossref", true) then
    -- don't decorate captions with crossrefs information if crossrefs are disabled
    return float
  end
  float = ensure_custom(float)
  -- nil should never happen here, but the Lua analyzer doesn't know it
  if float == nil then
    -- luacov: disable
    internal_error()
    -- luacov: enable
  end
  if float.caption_long and float.caption_long.content == nil then
    local error_msg = "FloatRefTarget has caption_long field of type " .. tostring(float.caption_long.t) .. " which doesn't support content: " .. float.identifier
    error(error_msg)
    return {}
  end
  if float.caption_long == nil then
    float.caption_long = pandoc.Plain({})
  end
  local caption_content = float.caption_long.content

  if float.parent_id then
    if float.order == nil then
      warn("Subfloat without crossref information")
    else
      prependSubrefNumber(caption_content, float.order)
    end
  else
    -- in HTML, unlabeled floats do not get a title prefix
    if (not is_unlabeled_float(float)) then
      local is_uncaptioned = not ((caption_content ~= nil) and (#caption_content > 0))
      -- this is a hack but we need it to control styling downstream
      float.is_uncaptioned = is_uncaptioned
      local title_prefix = float_title_prefix(float, not is_uncaptioned)
      tprepend(caption_content, title_prefix)
    end
  end
  return float
end

-- we need to expose this function for use in the docusaurus renderer,
-- which is technically an extension that doesn't have access to the
-- internal filters namespace
quarto.doc.crossref.decorate_caption_with_crossref = decorate_caption_with_crossref

function full_caption_prefix(float, subfloat)
  if not param("enable-crossref", true) then
    -- don't decorate captions with crossrefs information if crossrefs are disabled
    return {}
  end

  float = ensure_custom(float)
  -- nil should never happen here, but the Lua analyzer doesn't know it
  if float == nil then
    -- luacov: disable
    internal_error()
    -- luacov: enable
  end  

  if subfloat ~= nil then
    subfloat = ensure_custom(subfloat)
    -- nil should never happen here, but the Lua analyzer doesn't know it
    if subfloat == nil then
      -- luacov: disable
      internal_error()
      -- luacov: enable
    end  
  end

  local float_title = {}
  if not is_unlabeled_float(float) then
    float_title = float_title_prefix(float, false)
  end

  local subfloat_title = pandoc.Inlines({})
  if subfloat ~= nil then
    if subfloat.order == nil then
      warn("Subfloat without crossref information")
    else
      prependSubrefNumber(subfloat_title, subfloat.order)
    end
  end
  if #subfloat_title > 0 then
    tappend(float_title,{nbspString()})
  end
  tappend(float_title, subfloat_title)
  tappend(float_title, titleDelim())
  tappend(float_title, {pandoc.Space()})
  return pandoc.Inlines(float_title)
end

-- capture relevant figure attributes then strip them
local function get_figure_attributes(el)
  local align = figAlignAttribute(el)
  local keys = tkeys(el.attr.attributes)
  for _,k in pairs(keys) do
    if isFigAttribute(k) then
      el.attr.attributes[k] = nil
    end
  end
  local figureAttr = {}
  local style = el.attr.attributes["style"]
  if style then
    figureAttr["style"] = style
    el.attributes["style"] = nil
  end
  return {
    align = align,
    figureAttr = figureAttr
  }
end

_quarto.ast.add_renderer("FloatRefTarget", function(_)
  return _quarto.format.isLatexOutput()
end, function(float)
  local figEnv = latexFigureEnv(float)
  local figPos = latexFigurePosition(float, figEnv)
  local float_type = ref_type_from_float(float)

  local capLoc = cap_location(float)
  local caption_cmd_name = latexCaptionEnv(float)

  if float.content == nil then
    warn("FloatRefTarget with no content: " .. float.identifier)
    return pandoc.Div({})
  end

  if float.parent_id then
    if caption_cmd_name == kSideCaptionEnv then
      fail_and_ask_for_bugreport("Subcaptions for side captions are unimplemented.")
      return {}
    end
    caption_cmd_name = "subcaption"
  elseif float.content.t == "Table" and float_type == "tbl" then -- float.parent_id is nil here
    -- special-case the situation where the figure is Table and the content is Table
    --
    -- just return the table itself with the caption inside the table

    -- FIXME how about tables in margin figures?

    caption_cmd_name = "caption"
    float.content.caption.long = float.caption_long
    float.content.attr = pandoc.Attr(float.identifier, float.classes or {}, float.attributes or {})
    return float.content
  end

  local fig_scap = attribute(float, kFigScap, nil)
  if fig_scap then
    fig_scap = pandoc.Span(markdownToInlines(fig_scap))
  end

  local latex_caption
  if float.caption_long and type(float.caption_long) ~= "table" then
    latex_caption = quarto.utils.as_inlines(float.caption_long)
  else
    latex_caption = float.caption_long
  end
  latex_caption = latex_caption or pandoc.Inlines({})

  local label_cmd = quarto.LatexInlineCommand({
    name = "label",
    arg = pandoc.RawInline("latex", float.identifier)
  })
  latex_caption:insert(1, label_cmd)
  local latex_caption_content = latex_caption

  latex_caption = quarto.LatexInlineCommand({
    name = caption_cmd_name,
    opt_arg = fig_scap,
    arg = pandoc.Span(quarto.utils.as_inlines(latex_caption_content or {}) or {}) -- unnecessary to do the "or {}" bit but the Lua analyzer doesn't know that
  })

  if float.parent_id then
    -- need to fixup subtables because nested longtables appear to give latex fits
    local vAlign = validatedVAlign(float.attributes[kLayoutVAlign])
    local function handle_table(tbl)
      return latexTabular(tbl, vAlign)
    end
    if float.content.t == "Table" then
      float.content = handle_table(float.content)
    else
      float.content = _quarto.ast.walk(float.content, {
        Table = handle_table
      }) or pandoc.Div({}) -- unnecessary to do the "or {}" bit but the Lua analyzer doesn't know that
    end
  end

  -- we need Pandoc to render its table ahead of time in order to
  -- do the longtable fixups below
  float.content = _quarto.ast.walk(quarto.utils.as_blocks(float.content), {
    traverse = "topdown",
    Div = function(div)
      if div.classes:find_if(isStarEnv) then
        return _quarto.ast.walk(div, {
          Table = function(tbl)
            if float.type == "Table" then
              figEnv = "table*"
            else
              figEnv = "figure*"
            end
            local result = latexTabular(tbl)
            return result
          end
        }), false
      end
    end,
    Table = function(tbl)
      local cites = pandoc.List({})
      local guid_id = global_table_guid_id
      local uuid = "85b77c8a-261c-4f58-9b04-f21c67e0a758"
      tbl = _quarto.ast.walk(tbl, {
        Cite = function(cite)
          cites:insert(cite)
          guid_id = guid_id + 1
          -- this uuid is created a little strangely here
          -- to ensure that no generated uuid will be a prefix of another,
          -- which would cause our regex replacement to pick up the wrong
          -- uuid
          return pandoc.Str(uuid .. "-" .. guid_id .. "-" .. uuid)
        end
      })
      local raw_output = pandoc.RawBlock("latex", pandoc.write(pandoc.Pandoc({tbl}), "latex"))
      if #cites > 0 then
        local local_guid_id = global_table_guid_id
        local result = pandoc.Blocks({
          _quarto.ast.make_scaffold(pandoc.Span, cites:map(function(cite)
            local_guid_id = local_guid_id + 1
            return _quarto.ast.make_scaffold(pandoc.Span, pandoc.Inlines({
              pandoc.RawInline("latex", "%quarto-define-uuid: " .. uuid .. "-" .. local_guid_id .. "-" .. uuid .. "\n"),
              cite,
              pandoc.RawInline("latex", "\n%quarto-end-define-uuid\n")
            }))
          end)), raw_output})
        global_table_guid_id = global_table_guid_id + #cites
        return result
      else
        return raw_output
      end
    end
  })

  if float_type == "tbl" then
    local made_fix = false
    local function fix_raw(is_star_env)
      local function set_raw(el)
        if _quarto.format.isRawLatex(el) then
          local longtable_match, longtable_pattern = _quarto.modules.patterns.match_in_list_of_patterns(el.text, _quarto.patterns.latexLongtableEnvPatterns)
          if longtable_match and longtable_pattern then
            made_fix = true
            local raw = el
            -- special case for longtable floats in LaTeX
            local extended_pattern = {".-"}
            for _, pattern in ipairs(longtable_pattern) do
              table.insert(extended_pattern, pattern)
            end
            table.insert(extended_pattern, ".*")
            local longtable_preamble, longtable_begin, longtable_content, longtable_end, longtable_postamble = _quarto.modules.patterns.match_all_in_table(extended_pattern)(raw.text)
            if longtable_preamble == nil or longtable_begin == nil or longtable_content == nil or longtable_end == nil or longtable_postamble == nil then
              warn("Could not parse longtable parameters. This could happen because the longtable parameters\n" ..
              "are not well-formed or because of a bug in quarto. Please consider filing a bug report at\n" ..
              "https://github.com/quarto-dev/quarto-cli/issues/, and make sure to include the document that\n" ..
              "triggered this error.")
              return {}
            end
            -- Strip Pandoc 3.8+ LTcaptype definition since we're adding our own caption
            -- Keep the { } wrapper (harmless) to avoid orphan braces
            longtable_preamble = longtable_preamble:gsub("\\def\\LTcaptype{none}[^\n]*\n?", "")
            -- split the content into params and actual content
            -- params are everything in the first line of longtable_content
            -- actual content is everything else
            local start, content = split_longtable_start(longtable_begin .. longtable_content)
            if start == nil or content == nil then
              warn("Could not parse longtable parameters. This could happen because the longtable parameters\n" ..
              "are not well-formed or because of a bug in quarto. Please consider filing a bug report at\n" ..
              "https://github.com/quarto-dev/quarto-cli/issues/, and make sure to include the document that\n" ..
              "triggered this error.")
              return {}
            end
            local cap_loc = cap_location(float)
            if float.parent_id then
              -- need to fixup subtables because longtables don't support subcaptions,
              -- and longtable captions increment the wrong counter
              -- we try our best here

              fatal("longtables are not supported in subtables.\n" ..
                "This is not a Quarto bug - the LaTeX longtable environment doesn't support subcaptions.\n")
              return {}
            end
            if is_star_env then
              -- content: table payload
              -- start: \\begin{longtable}... command
              -- longtable_preamble: everything that came before the \\begin{longtable} command
              -- longtable_postamble: everything that came after the \\end{longtable} command
              local result = pandoc.Blocks({
                pandoc.RawBlock("latex", longtable_preamble),
                pandoc.RawBlock("latex", "\\begin{table*}"),
                -- caption here if cap_loc == "top"
                pandoc.RawBlock("latex", start .. "\n" .. content .. "\n\\end{longtable}"),
                -- caption here if cap_loc ~= "top"
                pandoc.RawBlock("latex", "\\end{table*}"),
                pandoc.RawBlock("latex", longtable_postamble),
              })
              if cap_loc == "top" then
                result:insert(3, latex_caption)
                -- gets around the padding that longtable* adds
                result:insert(4, pandoc.RawBlock("latex", "\\vspace{-1em}"))
              else
                result:insert(4, latex_caption)
              end
              return result
            else
              local result = pandoc.Blocks({latex_caption, pandoc.RawInline("latex", "\\tabularnewline")})
              -- if cap_loc is top, insert content on bottom
              if cap_loc == "top" then
                result:insert(pandoc.RawBlock("latex", content))        
              else
                result:insert(1, pandoc.RawBlock("latex", content))
              end
              result:insert(1, pandoc.RawBlock("latex", start))
              result:insert(1, pandoc.RawBlock("latex", longtable_preamble))
              result:insert(pandoc.RawBlock("latex", "\\end{longtable}"))
              result:insert(pandoc.RawBlock("latex", longtable_postamble))
              return result
            end
          end
      end
      end
      return set_raw
    end
    -- have to call as_blocks() again here because assigning to float.content
    -- goes through our AST metaclasses which coalesce a singleton list to a single AST element
    local fixed_up_content = _quarto.ast.walk(quarto.utils.as_blocks(float.content), {
      traverse = "topdown",
      Div = function(div)
        if div.classes:find_if(isStarEnv) then
          return _quarto.ast.walk(div, {
            RawBlock = fix_raw(true)
          }), false
        end
      end,
      RawBlock = fix_raw(false)
    })
    if made_fix then
      return fixed_up_content
    end
  end

  -- As an additional complication, we need to handle the case where the
  -- content is a table* environment, by stripping the environment raw code
  -- and recreating it below.
  -- See #7937
  if _quarto.format.isRawLatex(float.content) then
    local _b, _e, _beginenv, inner_content, _endenv = float.content.text:find(patterns.latex_table_star)
    if _b ~= nil then 
      figEnv = "table*"
      float.content.text = inner_content
    end
  end

  local figure_content
  local pt = pandoc.utils.type(float.content)
  if pt == "Block" then
    figure_content = pandoc.Blocks({ float.content })
  elseif pt == "Blocks" then
    figure_content = float.content
  else
    -- luacov: disable
    fail_and_ask_for_bug_report("Unexpected type for float content: " .. pt)
    return {}
    -- luacov: enable
  end
  assert(figure_content ~= nil)

  -- align the figure
  local align = figAlignAttribute(float)
  if align == "center" then
    figure_content = pandoc.Blocks({
      quarto.LatexBlockCommand({
        name = "centering",
        inside = true,
        arg = _quarto.ast.scaffold_element(figure_content)
      })
    })
  elseif align == "right" then
    local plain = quarto.utils.match("[1]/{Plain}")(figure_content)
    if plain then
      local cmd = quarto.LatexInlineCommand({
        name = "hfill",
      })
      plain[1].content:insert(1, cmd)
    else
      warn("Could not find a Plain node in figure content of " .. float.identifier .. " to right-align.")
    end
  end -- otherwise, do nothing
  -- figure_content:insert(1, pandoc.RawInline("latex", latexBeginAlign(align)))
  -- figure_content:insert(pandoc.RawInline("latex", latexEndAlign(align)))

  if latex_caption then
    if caption_cmd_name == kSideCaptionEnv then
      if #figure_content > 1 then
        figure_content:insert(1, latex_caption) -- Since this is a side caption, insert it physically above the figure to improve typsetting
      else
        figure_content:insert(latex_caption)
      end
    elseif capLoc == "top" then
      figure_content:insert(1, latex_caption)
    else
      figure_content:insert(latex_caption)
    end
  end

  if float.parent_id then
    -- the environment here is handled by the parent float and
    -- the panel layout code
    return figure_content
  else
    return quarto.LatexEnvironment({
      name = figEnv,
      pos = figPos,
      content = _quarto.ast.walk(figure_content, {
        Image = drop_class("column-margin")
      })
    })
  end
end)

_quarto.ast.add_renderer("FloatRefTarget", function(_)
  return _quarto.format.isHtmlOutput()
end, function(float)
  decorate_caption_with_crossref(float)
  return float_reftarget_render_html_figure(float)
end)

_quarto.ast.add_renderer("FloatRefTarget", function(_)
  return _quarto.format.isDocxOutput() or _quarto.format.isOdtOutput()
end, function(float)
  -- docx format requires us to annotate the caption prefix explicitly
  decorate_caption_with_crossref(float)

  -- options
  local options = {
    pageWidth = wpPageWidth(),
  }

  -- determine divCaption handler (always left-align)
  local divCaption = nil
  if _quarto.format.isDocxOutput() then
    divCaption = docxDivCaption
  elseif _quarto.format.isOdtOutput() then
    divCaption = odtDivCaption
  else
    -- luacov: disable
    internal_error()
    return
    -- luacov: enable
  end

  options.divCaption = function(el, align) return divCaption(el, "left") end

  -- get alignment
  local align = align_attribute(float)
  
  -- create the row/cell for the figure
  local row = pandoc.List()
  local cell = pandoc.Div({})
  cell.attr = pandoc.Attr(float.identifier, float.classes or {}, float.attributes or {})
  if float.content == nil then
    warn("FloatRefTarget with no content: " .. float.identifier)
    return pandoc.Div({})
  end
  local c = float.content.content or float.content
  if pandoc.utils.type(c) == "Block" then
    cell.content:insert(c)
  elseif pandoc.utils.type(c) == "Blocks" then
    cell.content = c
  elseif pandoc.utils.type(c) == "Inlines" then
    cell.content:insert(pandoc.Plain(c))
  end
  transfer_float_image_width_to_cell(float, cell)
  row:insert(cell)

  -- handle caption
  local new_caption = options.divCaption(float.caption_long, align)
  local caption_location = cap_location(float)
  if caption_location == 'top' then
    cell.content:insert(1, new_caption)
  else
    cell.content:insert(new_caption)
  end

  -- content fixups for docx, based on old docx.lua code
  cell = docx_content_fixups(cell, align)

  -- make the table
  local figureTable = pandoc.SimpleTable(
    pandoc.List(), -- caption
    { layoutTableAlign(align) },  
    {   1   },         -- full width
    pandoc.List(), -- no headers
    { row }            -- figure
  )
  
  -- return it
  return pandoc.utils.from_simple_table(figureTable)
end)

local figcaption_uuid = "0ceaefa1-69ba-4598-a22c-09a6ac19f8ca"

local function create_figcaption(float)
  local cap = float.caption_long
  if float.caption_long == nil or pandoc.utils.stringify(float.caption_long) == "" then
    cap = pandoc.Blocks({})
  end
  local ref_type = ref_type_from_float(float)
  local caption_location = cap_location(float)

  -- use a uuid to ensure that the figcaption ids won't conflict with real
  -- ids in the document
  local caption_id = float.identifier .. "-caption-" .. figcaption_uuid
  
  local classes = { }
  table.insert(classes, "quarto-float-caption-" .. caption_location)

  if float.parent_id then
    table.insert(classes, "quarto-subfloat-caption")
    table.insert(classes, "quarto-subfloat-" .. ref_type)
  else
    table.insert(classes, "quarto-float-caption")
    table.insert(classes, "quarto-float-" .. ref_type)
  end
  if float.is_uncaptioned then
    -- this figcaption will only contain the crossreferenceable label
    table.insert(classes, "quarto-uncaptioned")
  end

  return quarto.HtmlTag({
    name = "figcaption",
    attr = pandoc.Attr(caption_id, classes, {}),
    content = float.caption_long,
  }), caption_id, caption_location
end

function float_reftarget_render_html_figure(float)
  float = ensure_custom(float)
  if float == nil then
    -- luacov: disable
    internal_error()
    return pandoc.Div({})
    -- luacov: enable
  end

  local caption_content, caption_id, caption_location = create_figcaption(float)
  local caption_location = cap_location(float)

  local float_content = pandoc.Div(_quarto.ast.walk(float.content, {
    -- strip image captions
    Image = function(image)
      image.caption = pandoc.Inlines{}
      return image
    end
  }) or pandoc.Div({})) -- this should never happen but the lua analyzer doesn't know it
  if caption_id ~= nil then
    float_content.attributes["aria-describedby"] = caption_id
  end

  -- otherwise, we render the float as a div with the caption
  local div = pandoc.Div({})

  local found_image = pandoc.Div({})
  -- #7727: don't recurse into tables when searching for a figure from
  -- which to get attributes
  if float.content and float.content.t ~= "Table" then
    found_image = get_node_from_float_and_type(float, "Image", {
      Table = function(table)
        return nil, false
      end,
    }) or pandoc.Div({})
  end
  local figure_attrs = get_figure_attributes(found_image)

  div.attr = merge_attrs(
    pandoc.Attr(float.identifier, float.classes or {}, float.attributes or {}),
    pandoc.Attr("", {}, figure_attrs.figureAttr))
  if float.type == "Listing" then
    div.attr.classes:insert("listing")
    -- in the special case of listings, we likely have text content
    -- including annotations, which require left alignment
    -- we hard-code this here.
    -- https://github.com/quarto-dev/quarto-cli/issues/9724
    figure_attrs.align = "left"
  end
  div.attr.classes:insert("quarto-float")

  div.attr.classes:insert("quarto-figure")
  div.attr.classes:insert("quarto-figure-" .. figure_attrs.align)

  -- also forward any column or caption classes
  local currentClasses = found_image.attr.classes
  for _,k in pairs(currentClasses) do
    if isCaptionClass(k) or isColumnClass(k) then
      div.attr.classes:insert(k)
    end
  end

  local ref = ref_type_from_float(float)
  local figure_class
  if float.parent_id then
    figure_class = "quarto-subfloat-" .. ref
  else
    figure_class = "quarto-float-" .. ref
  end

  -- Notice that we need to insert the figure_div value
  -- into the div, but we need to use figure_tbl
  -- to manipulate the contents of the custom node. 
  --
  -- This is because the figure_div is a pandoc.Div (required to
  -- be inserted into pandoc divs), but figure_tbl is
  -- the lua table with the metatable required to marshal
  -- the inner contents of the custom node.
  --
  -- This is relatively ugly, and another instance
  -- of the impedance mismatch we have in the custom AST
  -- API. 
  -- 
  -- it's possible that the better API is for custom constructors
  -- to always return a Lua object and then have a separate
  -- function to convert that to a pandoc AST node.
  local figure_div, figure_tbl = quarto.HtmlTag({
    name = "figure",
    attr = pandoc.Attr("", {"quarto-float", figure_class}, {}),
  })
  
  figure_tbl.content.content:insert(float_content)
  if caption_content ~= nil then
    if caption_location == 'top' then
      figure_tbl.content.content:insert(1, caption_content)
    else
      figure_tbl.content.content:insert(caption_content)
    end
  end
  div.content:insert(figure_div)
  return div
end

_quarto.ast.add_renderer("FloatRefTarget", function(_)
  return _quarto.format.isAsciiDocOutput()
end, function(float)
  if float.content.t == "Plain" and #float.content.content == 1 and float.content.content[1].t == "Image" then
    return pandoc.Figure(
      {float.content},
      {float.caption_long},
      float.identifier)
  end

  if float.type == "Table" and float.content.t == "Table" then
    -- special-case the situation where the figure is Table and the content is Table
    --
    -- just return the table itself with the caption inside the table
    float.content.caption.long = float.caption_long
    float.content.attr = pandoc.Attr(float.identifier, float.classes or {}, float.attributes or {})
    return pandoc.Blocks({
      pandoc.RawBlock("asciidoc", "[[" .. float.identifier .. "]]\n"),
      float.content
    })
  end

  -- if this is a "linked figure Div", render it as such.
  local link = quarto.utils.match("Plain/[1]/{Link}/[1]/{Image}")(float.content)
  if link then
    link[2].identifier = float.identifier
    local caption = quarto.utils.as_inlines(float.caption_long)
    table.insert(caption, 1, pandoc.RawInline("asciidoc", "."))
    table.insert(caption, pandoc.RawInline("asciidoc", "\n[[" .. float.identifier .. "]]\n"))
    table.insert(caption, link[1])
    return caption
  end

  -- if the float consists of exactly one image,
  -- render it as a pandoc Figure node.
  local count = 0
  local img
  _quarto.ast.walk(float.content, {
    Image = function(node)
      count = count + 1
      img = node
    end
  })
  if count == 1 then
    img.identifier = float.identifier
    img.caption = quarto.utils.as_inlines(float.caption_long)
    return pandoc.Figure(
      {img},
      {float.caption_long},
      float.identifier)
  end

  -- Fallthrough case, render into a div.
  float.caption_long.content:insert(1, pandoc.RawInline("asciidoc", "."))
  float.caption_long.content:insert(pandoc.RawInline("asciidoc", "\n[[" .. float.identifier .. "]]\n===="))

  if pandoc.utils.type(float.content) == "Blocks" then
    float.content:insert(1, float.caption_long)
    float.content:insert(pandoc.RawBlock("asciidoc", "====\n"))
    return float.content
  else
    return pandoc.Blocks({
      float.caption_long,
      -- pandoc.RawBlock("asciidoc", "[[" .. float.identifier .. "]]\n====\n"),
      float.content,
      pandoc.RawBlock("asciidoc", "====\n\n")
    })
  end

end)

_quarto.ast.add_renderer("FloatRefTarget", function(_)
  return _quarto.format.isJatsOutput()
end, function(float)
  -- don't emit unlabeled floats in JATS
  if is_unlabeled_float(float) then
    float.identifier = ""
  end
  decorate_caption_with_crossref(float)
  return pandoc.Figure(
    quarto.utils.as_blocks(float.content),
    {float.caption_long},
    float.identifier
  )
end)

_quarto.ast.add_renderer("FloatRefTarget", function(_)
  return _quarto.format.isIpynbOutput() and param("enable-crossref", true)
end, function(float)
  decorate_caption_with_crossref(float)
  if float.content.t == "Plain" and #float.content.content == 1 and float.content.content[1].t == "Image" then
    return pandoc.Figure(
      {float.content},
      {float.caption_long},
      float.identifier)
  end

  local blocks = pandoc.Blocks(float.content)
  blocks:insert(pandoc.Para(quarto.utils.as_inlines(float.caption_long) or {}))
  return pandoc.Div(blocks)
end)

-- this should really be "_quarto.format.isEmbedIpynb()" or something like that..
_quarto.ast.add_renderer("FloatRefTarget", function(_)
  return _quarto.format.isIpynbOutput() and not param("enable-crossref", true)
end, function(float)
  if float.content.t == "Plain" and #float.content.content == 1 and float.content.content[1].t == "Image" then
    local imgEl = float.content.content[1]
    if not float.in_code_cell_output then
      imgEl.identifier = float.identifier
      imgEl.caption =  quarto.utils.as_inlines(float.caption_long) or {}
    end
    return pandoc.Para({imgEl})
  elseif float.in_code_cell_output then
    -- If the float is in a code_cell_output, it is ok to drop the identifier
    -- and caption, because that infdormation is still carried by the cell itself
    return float.content
  else
    -- TODO: Need to deal with other cases, such as flextable, which results in a 
    -- Table which contains a FloatRefTarget (with an image/figure) inside of it.
    return float.content
  end
end)

_quarto.ast.add_renderer("FloatRefTarget", function(_)
  return _quarto.format.isTypstOutput()
end, function(float)
  -- Get crossref info first (needed for both margin and regular figures)
  local ref = ref_type_from_float(float)
  local info = crossref.categories.by_ref_type[ref]
  if info == nil then
    -- luacov: disable
    warning("Unknown float type: " .. ref .. "\n Will emit without crossref information.")
    return float.content
    -- luacov: enable
  end
  local kind = "quarto-float-" .. ref
  local supplement = titleString(ref, info.name)

  -- For figures: mark images so typst.lua won't use caption-as-alt fallback
  -- when caption IS the visible figure caption (not an explicit alt override).
  -- In Pandoc 3, {alt="text"} replaces image.caption with the alt value,
  -- so image.caption != float.caption means an explicit alt was provided.
  if ref == "fig" then
    local float_caption_text = pandoc.utils.stringify(float.caption_long or {})
    float.content = _quarto.ast.walk(float.content, {
      Image = function(img)
        if pandoc.utils.stringify(img.caption) == float_caption_text then
          img.attributes["_quarto_no_caption_alt"] = "true"
        end
        return img
      end
    })
  end

  -- Inject show rule to left-align listing figures (only once per document)
  -- This overrides any template centering for listing-kind figures
  -- https://github.com/quarto-dev/quarto-cli/issues/9724
  if ref == "lst" and not injected_listing_align_rule then
    injected_listing_align_rule = true
    quarto.doc.include_text("before-body", [[
#show figure.where(kind: "quarto-float-lst"): set align(start)
]])
  end

  -- Check if this is a margin figure (has .column-margin or .aside class)
  -- Skip margin handling for subfloats - the parent handles margin placement
  if hasMarginColumn(float) and not float.parent_id then
    local content = quarto.utils.as_blocks(float.content or {})

    -- Get optional attributes
    local shift = float.attributes and float.attributes["shift"] or "auto"
    local alignment = float.attributes and float.attributes["alignment"] or "baseline"
    local dy = float.attributes and float.attributes["dy"] or "0pt"

    -- Get caption location (tables default to top, figures to bottom)
    local caption_location = cap_location(float)
    if caption_location ~= "top" and caption_location ~= "bottom" then
      caption_location = "bottom"
    end

    -- Check for subfloats - need to use quarto_super wrapped in note()
    if float.has_subfloats then
      -- Wrap quarto_super in note() for margin placement with proper subfloat numbering
      local result = pandoc.Blocks({})
      result:insert(pandoc.RawBlock("typst",
        '#note(counter: none, alignment: "' .. alignment .. '", dy: ' .. dy ..
        ', shift: ' .. _quarto.format.typst.format_shift_param(shift) .. ')['))
      result:insert(_quarto.format.typst.function_call("quarto_super", {
        {"kind", kind},
        {"caption", _quarto.modules.typst.as_typst_content(float.caption_long)},
        {"label", pandoc.RawInline("typst", "<" .. float.identifier .. ">")},
        {"position", pandoc.RawInline("typst", caption_location)},
        {"supplement", supplement},
        {"subcapnumbering", "(a)"},
        _quarto.modules.typst.as_typst_content(content)
      }, false))
      result:insert(pandoc.RawBlock("typst", ']\n\n'))
      return result
    end

    -- No subfloats - use notefigure for margin placement
    return make_typst_margin_figure {
      content = content,
      caption = float.caption_long,
      caption_location = caption_location,
      identifier = float.identifier,
      shift = shift,
      alignment = alignment,
      dy = dy,
      kind = kind,
      supplement = supplement
    }
  end

  -- Check for margin caption (figure in main column, caption in margin)
  if hasMarginCaption(float) then
    local content = quarto.utils.as_blocks(float.content or {})
    -- Margin captions align with top of content (consistent with HTML visual behavior)
    local alignment = "top"

    return make_typst_margin_caption_figure {
      content = content,
      caption = float.caption_long,
      identifier = float.identifier,
      kind = kind,
      supplement = supplement,
      alignment = alignment,
    }
  end

  -- Check for full-width classes (column-page-right, column-page, column-screen, etc.)
  -- Note: For cell outputs, columns.lua wraps the cell-output-display div in wideblock.
  -- For fenced divs, the FloatRefTarget has the class and needs to wrap itself.
  local wideblock_side = getWideblockSide(float.classes)
  if wideblock_side then
    local content = quarto.utils.as_blocks(float.content or {})
    local caption_location = cap_location(float)
    if caption_location ~= "top" and caption_location ~= "bottom" then
      caption_location = "bottom"
    end

    -- Render standard figure first
    local figure_blocks = make_typst_figure {
      content = content,
      caption_location = caption_location,
      caption = float.caption_long,
      kind = kind,
      supplement = supplement,
      numbering = info.numbering,
      identifier = float.identifier
    }

    -- Wrap in wideblock
    return make_typst_wideblock {
      content = figure_blocks,
      side = wideblock_side,
    }
  end

  -- FIXME: custom numbering doesn't work yet
  -- local numbering = ""
  -- if float.parent_id then
  --   numbering = "(a)"
  -- else
  --   numbering = "1"
  -- end
  local content = quarto.utils.as_blocks(float.content or {})
  local caption_location = cap_location(float)

  if caption_location == "margin" then
    -- Margin captions should have been caught by hasMarginCaption check above.
    -- If we reach here, margin-layout may not be active. Fall back to bottom.
    caption_location = "bottom"
  elseif caption_location ~= "top" and caption_location ~= "bottom" then
    -- Unknown caption location, warn and default to bottom
    warn("Typst does not support this caption location: " .. caption_location .. ". Defaulting to bottom for '" .. float.identifier .. "'.")
    caption_location = "bottom"
  end

  if float.has_subfloats then
    -- subrefnumbering defaults to subfloat-numbering in quarto_super
    -- (simple "1a" for articles, chapter-based "1.1a" for books)
    return _quarto.format.typst.function_call("quarto_super", {
      {"kind", kind},
      {"caption", _quarto.modules.typst.as_typst_content(float.caption_long)},
      {"label", pandoc.RawInline("typst", "<" .. float.identifier .. ">")},
      {"position", pandoc.RawInline("typst", caption_location)},
      {"supplement", supplement},
      {"subcapnumbering", "(a)"},
      _quarto.modules.typst.as_typst_content(content)
    }, false)
  else
    return make_typst_figure {
      content = content,
      caption_location = caption_location,
      caption = float.caption_long,
      kind = kind,
      supplement = supplement,
      -- numbering = numbering,
      identifier = float.identifier
    }
  end
end)

_quarto.ast.add_renderer("FloatRefTarget", function(_)
  return _quarto.format.is_github_markdown_output()
end, function(float)
  decorate_caption_with_crossref(float)

  local caption_location = cap_location(float)

  local open_block = pandoc.RawBlock("markdown", "<div id=\"" .. float.identifier .. "\">\n")
  local close_block = pandoc.RawBlock("markdown", "</div>")
  local result = pandoc.Blocks({open_block})
  local insert_content = function()
    if pandoc.utils.type(float.content) == "Block" then
      result:insert(float.content)
    else
      result:extend(quarto.utils.as_blocks(float.content))
    end
  end
  local insert_caption = function()
    if pandoc.utils.type(float.caption_long) == "Block" then
      result:insert(float.caption_long)
    else
      result:insert(pandoc.Plain(quarto.utils.as_inlines(float.caption_long)))
    end
  end

  if caption_location == "top" then
    insert_caption()
    insert_content()
    result:insert(close_block)
  else
    insert_content()
    result:insert(pandoc.RawBlock("markdown", "\n"))
    insert_caption()
    result:insert(pandoc.RawBlock("markdown", "\n"))
    result:insert(close_block)
  end
  return result
end)

_quarto.ast.add_renderer("FloatRefTarget", function(_)
  return _quarto.format.is_powerpoint_output()
end, function(float)
  if float.content == nil then
    warn("Can't render float without content")
    return pandoc.Null()
  end
  local im_plain = quarto.utils.match("Plain/[1]/Image")(float.content)
  local im_para = quarto.utils.match("Para/[1]/Image")(float.content)
  if not im_plain and not im_para then
    warn("PowerPoint output for FloatRefTargets require a single image as content")
    return pandoc.Null()
  end

  local im = im_plain or im_para
  decorate_caption_with_crossref(float)
  im.caption = quarto.utils.as_inlines(float.caption_long)
  return pandoc.Para({im})
end)

global_table_guid_id = 0
-- proof.lua
-- custom AST node for proofs, remarks, solutions, etc.

-- Copyright (C) 2023 Posit Software, PBC

-- available proof types

proof_types = {
  proof =  {
    env = 'proof',
    title = 'Proof'
  },
  remark =  {
    env = 'remark',
    title = 'Remark'
  },
  solution = {
    env = 'solution',
    title = 'Solution'
  }
}

function proof_type(el)
  local type = el.attr.classes:find_if(function(clz) return proof_types[clz] ~= nil end)
  if type ~= nil then
    return proof_types[type]
  else
    return nil
  end
end

_quarto.ast.add_handler({
  -- empty table so this handler is only called programmatically
  class_name = {},

  -- the name of the ast node, used as a key in extended ast filter tables
  ast_name = "Proof",

  -- generic names this custom AST node responds to
  -- this is still unimplemented
  interfaces = {"Crossref"},

  -- Proofs are always blocks
  kind = "Block",

  parse = function(div)
    -- luacov: disable
    internal_error()
    -- luacov: enable
  end,

  slots = { "div", "name" },

  constructor = function(tbl)
    return {
      name = tbl.name,
      div = tbl.div,
      identifier = tbl.identifier,
      type = tbl.type -- proofs can be unnumbered and lack an identifier; we need to know the type explicitly
    }
  end
})

function is_proof_div(div)
  local ref = refType(div.identifier)
  if ref ~= nil then
    local tbl = crossref.categories.by_ref_type[ref]
    if tbl then
      local key = tbl.name:lower()
      return proof_types[key]
    end
  end
  return is_regular_node(div, "Div") and proof_type(div) ~= nil
end

_quarto.ast.add_renderer("Proof", function()
  return true 
end, function(proof_tbl)
  local el = proof_tbl.div
  -- see if this is a proof, remark, or solution
  local proof = proof_types[proof_tbl.type:lower()]
  if proof == nil then
    internal_error()
    return pandoc.Blocks({})
  end

  -- ensure requisite latex is injected
  crossref.using_theorems = true

  if proof.env ~= "proof" then
    el.attr.classes:insert("proof")
  end

  local name = quarto.utils.as_inlines(proof_tbl.name or pandoc.Inlines({}))

  -- output
  if _quarto.format.isLatexOutput() then
    local preamble = pandoc.List()
    local env = proof.env

    local has_ref = refType(proof_tbl.identifier) ~= nil
    if has_ref then
      env = "ref" .. env
    end

    preamble:insert(pandoc.RawInline("latex", "\\begin{" .. env .. "}"))
    if #name ~= 0 then
      preamble:insert(pandoc.RawInline("latex", "["))
      tappend(preamble, name)
      preamble:insert(pandoc.RawInline("latex", "]"))
    end
    preamble:insert(pandoc.RawInline("latex", "\n"))
    if #el.content == 0 then
      warn("Proof block has no content; skipping")
      return pandoc.Null()
      -- https://github.com/quarto-dev/quarto-cli/issues/6077
    elseif el.content[1].t == "Para" then
      preamble:extend(el.content[1].content)
      el.content[1].content = preamble
    else
      if (el.content[1].t ~= "Para") then
        -- required trick to get correct alignement when non Para content first
        preamble:insert(pandoc.RawInline('latex', "\\leavevmode"))
      end
      el.content:insert(1, pandoc.Plain(preamble))
    end
    if has_ref then
      el.content:insert(pandoc.RawInline("latex",
        "\\label{" .. proof_tbl.identifier .. "}")
      )
    end
    local end_env = "\\end{" .. env .. "}"
    -- https://github.com/quarto-dev/quarto-cli/issues/6077
    if el.content[#el.content].t == "Para" then
      el.content[#el.content].content:insert(pandoc.RawInline("latex", "\n" .. end_env))
    elseif el.content[#el.content].t == "RawBlock" and el.content[#el.content].format == "latex" then
      -- this is required for no empty line between end_env and previous latex block
      el.content[#el.content].text = el.content[#el.content].text .. "\n" .. end_env
    else
      el.content:insert(pandoc.RawBlock("latex", end_env))
    end
  elseif _quarto.format.isJatsOutput() then
    el = jatsTheorem(el,  nil, name )
  else
    el.classes:insert(proof.title:lower())
    local span_title = pandoc.Emph(pandoc.Str(envTitle(proof.env, proof.title)))
    local entry = crossref.index.entries[proof_tbl.identifier]
    local type = refType(proof_tbl.identifier)
    if type then
      el.identifier = proof_tbl.identifier
    end
    if entry then
      span_title.content:insert(pandoc.Space())
      span_title.content:extend(refNumberOption(type, entry))      
    end

    local span = pandoc.Span({ span_title }, pandoc.Attr("", { "proof-title" }))
    if #name > 0 then
      span.content:insert(pandoc.Str(" ("))
      tappend(span.content, name)
      span.content:insert(pandoc.Str(")"))
    end
    tappend(span.content, { pandoc.Str(". ")})

    -- if the first block is a paragraph, then prepend the title span
    if #el.content > 0 and 
        el.content[1].t == "Para" and
        el.content[1].content ~= nil and 
        #el.content[1].content > 0 then
      el.content[1].content:insert(1, span)
    else
      -- else insert a new paragraph
      el.content:insert(1, pandoc.Para{span})
    end
  end

  return el

end)
-- theorem.lua
-- custom AST node for theorems, lemmata, etc.
-- 
-- Copyright (C) 2023 Posit Software, PBC

-- available theorem types
theorem_types = {
  thm = {
    env = "theorem",
    style = "plain",
    title = "Theorem"
  },
  lem = {
    env = "lemma",
    style = "plain",
    title = "Lemma"
  },
  cor = {
    env = "corollary",
    style = "plain",
    title = "Corollary",
  },
  prp = {
    env = "proposition",
    style = "plain",
    title = "Proposition",
  },
  cnj = {
    env = "conjecture",
    style = "plain",
    title = "Conjecture"
  },
  def = {
    env = "definition",
    style = "definition",
    title = "Definition",
  },
  exm = {
    env = "example",
    style = "definition",
    title = "Example",
  },
  exr = {
    env = "exercise",
    style = "definition",
    title = "Exercise"
  },
  alg = {
    env = "algorithm",
    style = "plain",
    title = "Algorithm"
  },
}

function has_theorem_ref(el)
  local type = refType(el.attr.identifier)
  return theorem_types[type] ~= nil
end

function is_theorem_div(div)
  return is_regular_node(div, "Div") and has_theorem_ref(div)
end

_quarto.ast.add_handler({

  -- empty table so this handler is only called programmatically
  class_name = {},

  -- the name of the ast node, used as a key in extended ast filter tables
  ast_name = "Theorem",

  -- generic names this custom AST node responds to
  -- this is still unimplemented
  interfaces = {"Crossref"},

  -- Theorems are always blocks
  kind = "Block",

  parse = function(div)
    -- luacov: disable
    internal_error()
    -- luacov: enable
  end,

  slots = { "div", "name" },

  constructor = function(tbl)
    return {
      name = tbl.name,
      div = tbl.div,
      identifier = tbl.identifier
    }
  end
})

-- Get theorem-appearance option (simple, fancy, clouds, rainbow)
local function get_theorem_appearance()
  local appearance = option("theorem-appearance", "simple")
  if appearance ~= nil and type(appearance) == "table" then
    appearance = pandoc.utils.stringify(appearance)
  end
  return appearance or "simple"
end

-- Color mapping for clouds/rainbow themes (per theorem type)
local theme_colors = {
  thm = "red", lem = "teal", cor = "navy", prp = "blue",
  cnj = "navy", def = "olive", exm = "green", exr = "purple", alg = "maroon"
}

local included_typst_theorems = false
local letted_typst_theorem = {}
local function ensure_typst_theorems(reftype)
  local appearance = get_theorem_appearance()

  if not included_typst_theorems then
    included_typst_theorems = true

    if appearance == "fancy" then
      -- Import theorion's make-frame and fancy-box theming
      quarto.doc.include_text("in-header", [[
#import "@preview/theorion:0.4.1": make-frame, cosmos
#import cosmos.fancy: fancy-box, set-primary-border-color, set-primary-body-color, set-secondary-border-color, set-secondary-body-color, set-tertiary-border-color, set-tertiary-body-color, get-primary-border-color, get-primary-body-color, get-secondary-border-color, get-secondary-body-color, get-tertiary-border-color, get-tertiary-body-color
]])
      -- Set theorem colors from brand-color (runs in before-body, after brand-color is defined)
      quarto.doc.include_text("before-body", [[
#set-primary-border-color(brand-color.at("primary", default: green.darken(30%)))
#set-primary-body-color(brand-color.at("primary", default: green).lighten(90%))
#set-secondary-border-color(brand-color.at("secondary", default: orange))
#set-secondary-body-color(brand-color.at("secondary", default: orange).lighten(90%))
#set-tertiary-border-color(brand-color.at("tertiary", default: blue.darken(30%)))
#set-tertiary-body-color(brand-color.at("tertiary", default: blue).lighten(90%))
]])
    elseif appearance == "clouds" then
      -- Import theorion's make-frame and clouds render function
      quarto.doc.include_text("in-header", [[
#import "@preview/theorion:0.4.1": make-frame, cosmos
#import cosmos.clouds: render-fn as clouds-render
]])
    elseif appearance == "rainbow" then
      -- Import theorion's make-frame and rainbow render function
      quarto.doc.include_text("in-header", [[
#import "@preview/theorion:0.4.1": make-frame, cosmos
#import cosmos.rainbow: render-fn as rainbow-render
]])
    else -- simple (default)
      -- Import only make-frame and define simple render function
      quarto.doc.include_text("in-header", [[
#import "@preview/theorion:0.4.1": make-frame

// Simple theorem render: bold title with period, italic body
#let simple-theorem-render(prefix: none, title: "", full-title: auto, body) = {
  if full-title != "" and full-title != auto and full-title != none {
    strong[#full-title.]
    h(0.5em)
  }
  emph(body)
  parbreak()
}
]])
    end
  end

  if not letted_typst_theorem[reftype] then
    letted_typst_theorem[reftype] = true
    local theorem_type = theorem_types[reftype]
    local title = titleString(reftype, theorem_type.title)

    -- Build render code based on appearance
    local render_code
    if appearance == "fancy" then
      -- Map theorem styles to color schemes (primary=definitions, secondary=theorems, tertiary=propositions)
      local color_scheme = "secondary" -- default for most theorem types
      if theorem_type.style == "definition" then
        color_scheme = "primary"
      elseif reftype == "prp" then
        color_scheme = "tertiary"
      end
      render_code = "  render: fancy-box.with(\n" ..
        "    get-border-color: get-" .. color_scheme .. "-border-color,\n" ..
        "    get-body-color: get-" .. color_scheme .. "-body-color,\n" ..
        "    get-symbol: loc => none,\n" ..
        "  ),\n"
    elseif appearance == "clouds" then
      local color = theme_colors[reftype] or "gray"
      render_code = "  render: clouds-render.with(fill: " .. color .. ".lighten(85%)),\n"
    elseif appearance == "rainbow" then
      local color = theme_colors[reftype] or "gray"
      render_code = "  render: rainbow-render.with(fill: " .. color .. ".darken(20%)),\n"
    else -- simple
      render_code = "  render: simple-theorem-render,\n"
    end

    -- Use theorion's make-frame with appropriate render
    quarto.doc.include_text("in-header", "#let (" .. theorem_type.env .. "-counter, " .. theorem_type.env .. "-box, " ..
      theorem_type.env .. ", show-" .. theorem_type.env .. ") = make-frame(\n" ..
      "  \"" .. theorem_type.env .. "\",\n" ..
      "  text(weight: \"bold\")[" .. title .. "],\n" ..
      "  inherited-levels: theorem-inherited-levels,\n" ..
      "  numbering: theorem-numbering,\n" ..
      render_code ..
      ")")
    quarto.doc.include_text("in-header", "#show: show-" .. theorem_type.env)
  end
end


_quarto.ast.add_renderer("Theorem", function()
  return true 
end, function(thm)
  local el = thm.div
  local pt = pandoc.utils.type(el)
  if pt == "Blocks" or el.t ~= "Div" then
    el = pandoc.Div(el)
  end

  el.identifier = thm.identifier -- restore identifier to render correctly
  local label = thm.identifier
  local type = refType(thm.identifier)
  local name = quarto.utils.as_inlines(thm.name)
  local theorem_type = theorem_types[refType(thm.identifier)]
  local order = thm.order

  -- add class for type
  el.attr.classes:insert("theorem")
  if theorem_type.env ~= "theorem" then
    el.attr.classes:insert(theorem_type.env)
  end
    
  -- If this theorem has no content, then create a placeholder
  if #el.content == 0 or el.content[1].t ~= "Para" then
    tprepend(el.content, {pandoc.Para({pandoc.Str '\u{a0}'})})
  end

  if _quarto.format.isLatexOutput() then
    local preamble = pandoc.Para(pandoc.RawInline("latex", 
      "\\begin{" .. theorem_type.env .. "}"))
    preamble.content:insert(pandoc.RawInline("latex", "["))
    if name then
      tappend(preamble.content, name)
    end
    preamble.content:insert(pandoc.RawInline("latex", "]"))
    preamble.content:insert(pandoc.RawInline("latex",
      "\\protect\\hypertarget{" .. label .. "}{}\\label{" .. label .. "}")
    )
    el.content:insert(1, preamble)
    el.content:insert(pandoc.Para(pandoc.RawInline("latex", 
      "\\end{" .. theorem_type.env .. "}"
    )))
    -- Remove id on those div to avoid Pandoc inserting \hypertaget #3776
    el.attr.identifier = ""
  elseif _quarto.format.isJatsOutput() then

    -- JATS XML theorem
    local lbl = captionPrefix({}, type, theorem_type, order)
    el = jatsTheorem(el, lbl, name)          

  elseif _quarto.format.isTypstOutput() then
    ensure_typst_theorems(type)
    local preamble = pandoc.Plain({pandoc.RawInline("typst", "#" .. theorem_type.env .. "(")})
    if name and #name > 0 then
      preamble.content:insert(pandoc.RawInline("typst", 'title: "'))
      tappend(preamble.content, name)
      preamble.content:insert(pandoc.RawInline("typst", '"'))
    end
    preamble.content:insert(pandoc.RawInline("typst", ")["))
    local callthm = make_scaffold(pandoc.Div, preamble)
    tappend(callthm.content, quarto.utils.as_blocks(el.content))
    callthm.content:insert(pandoc.RawInline("typst", "] <" .. el.attr.identifier .. ">"))
    return callthm

  else
    -- order might be nil in the case of an ipynb rendering in
    -- manuscript mode
    --
    -- FIXME format == ipynb and enableCrossRef == false should be
    -- its own rendering format
    if order == nil then
      return el
    end
    -- create caption prefix
    local captionPrefix = captionPrefix(name, type, theorem_type, order)
    local prefix =  { 
      pandoc.Span(
        pandoc.Strong(captionPrefix), 
        pandoc.Attr("", { "theorem-title" })
      ),
      pandoc.Space()
    }

    -- prepend the prefix
    local caption = el.content[1]

    if caption.content == nil then
      -- https://github.com/quarto-dev/quarto-cli/issues/2228
      -- caption doesn't always have a content field; in that case,
      -- use the parent?
      tprepend(el.content, prefix)
    else
      tprepend(caption.content, prefix)
    end
  end
 
  return el

end)
-- panellayout.lua
-- Copyright (C) 2023 Posit Software, PBC

local function parse_width(value)
  if value:sub(-1) == "%" then
    return tonumber(value:sub(1, -2)) / 100
  else
    return tonumber(value)
  end
end

function forward_widths_to_subfloats(layout)
  -- forward computed widths to the subfloats
  local width_table = {}
  
  for i, row in ipairs(layout.layout) do
    for j, cell in ipairs(row) do
      local width = cell.attributes["width"]
      if is_regular_node(cell, "Div") and width then
        local data = _quarto.ast.resolve_custom_data(cell)
        _quarto.ast.walk(cell, {
          FloatRefTarget = function(float)
            local id = float.identifier
            width_table[id] = parse_width(width)
          end
        })
      end
    end
  end
  
  _quarto.ast.walk(layout.float, {
    FloatRefTarget = function(float)
      local id = float.identifier
      if width_table[id] then
        float.width = width_table[id]
      end
    end
  })
end

_quarto.ast.add_handler({

  -- empty table so this handler is only called programmatically
  class_name = {},

  -- the name of the ast node, used as a key in extended ast filter tables
  ast_name = "PanelLayout",

  -- float crossrefs are always blocks
  kind = "Block",

  parse = function(div)
    -- luacov: disable
    internal_error()
    -- luacov: enable
  end,

  slots = { "preamble", "rows", "caption_long", "caption_short" },

  -- NB this constructor mutates the .attributes field!
  constructor = function(tbl)
    if tbl.float then
      tbl.is_float_reftarget = true
      tbl.classes = tbl.float.classes
      tbl.identifier = tbl.float.identifier
      tbl.attributes = tbl.float.attributes
      tbl.caption_long = tbl.float.caption_long
      tbl.caption_short = tbl.float.caption_short
      tbl.order = tbl.float.order
      tbl.type = tbl.float.type
    else
      tbl.is_float_reftarget = false
      if tbl.attr then
        tbl.identifier = tbl.attr.identifier
        tbl.classes = tbl.attr.classes
        tbl.attributes = as_plain_table(tbl.attr.attributes)
        tbl.attr = nil
      end
      tbl.preamble = not _quarto.utils.is_empty_node(tbl.preamble) and pandoc.Div(tbl.preamble) or nil
    end
    -- compute vertical alignment and remove attribute
    if tbl.attributes == nil then
      tbl.attributes = {}
    end
    local vAlign = validatedVAlign(tbl.attributes[kLayoutVAlign])
    tbl.attributes[kLayoutVAlign] = nil
    tbl.valign_class = vAlignClass(vAlign)

    -- construct a minimal rows-cells div scaffolding
    -- so contents are properly stored in the cells slot

    -- #12344: if there are decoratedcodeblocks inside the layout,
    -- we need to ask them to render themselves as [H] or we'll get outer par mode errors.
    local layout = tbl.layout
    if quarto.format.isLatexOutput() then
      layout = pandoc.List(tbl.layout):map(function(lst)
        return pandoc.List(lst):map(function(cell)
          return _quarto.ast.walk(cell, {
            DecoratedCodeBlock = function(decorated)
              decorated.hold = true
              return decorated
            end
          })
        end)
      end)
    end
    local rows_div = pandoc.Div({})
    for i, row in ipairs(layout) do
      local row_div = pandoc.Div(row)
      if tbl.is_float_reftarget then
        row_div = _quarto.ast.walk(row_div, {
          traverse = "topdown",
          Div = function(div)
            local found = false
            -- if it has a ref parent then give it another class
            -- (used to provide subcaption styling)
            local new_div = _quarto.ast.walk(div, {
              FloatRefTarget = function(float)
                if float.parent_id then
                  div.attr.classes:insert("quarto-layout-cell-subref")
                  div.attr.attributes["ref-parent"] = float.parent_id
                end
              end,
            })
            return div
          end,
        }) or {} -- this isn't needed but the type system doesn't know that
      end
      rows_div.content:insert(row_div)
    end
    tbl.rows = rows_div

    if tbl.float then 
      forward_widths_to_subfloats(tbl)
    end

    return tbl
  end
})

_quarto.ast.add_renderer("PanelLayout", function (panel)
  return true
end, function(panel)
  warn("No renderer for PanelLayout")
  if panel.float then
    return panel.float
  end

  warn("Don't know how to render PanelLayout without a float; will return empty output")
  return pandoc.Div({})

end)

-- we mostly use this function as a template to copy-and-paste into
-- other functions.
-- This is pretty ugly, but the kinds of things that need to change across
-- formats are not always the same, so it's hard to make a generic function
function basic_panel_layout(layout)
  if layout.float == nil then
    fail_and_ask_for_bug_report("Can't render layouts without floats")
    return pandoc.Div({})
  end
  decorate_caption_with_crossref(layout.float)

  -- empty options by default
  if not options then
    options = {}
  end
  -- outer panel to contain css and figure panel
  local attr = pandoc.Attr(layout.identifier or "", layout.classes or {}, layout.attributes or {})
  local panel_content = pandoc.Blocks({})
  -- layout
  for i, row in ipairs(layout.layout) do
    
    local aligns = row:map(function(cell) 
      -- get the align
      local align = cell.attributes[kLayoutAlign]
      return layoutTableAlign(align) 
    end)
    local widths = row:map(function(cell) 
      -- propagage percents if they are provided
      local layoutPercent = horizontalLayoutPercent(cell)
      if layoutPercent then
        return layoutPercent / 100
      else
        return 0
      end
    end)

    local cells = pandoc.List()
    for _, cell in ipairs(row) do
      cells:insert(cell)
    end
    
    -- make the table
    local panelTable = pandoc.SimpleTable(
      pandoc.List(), -- caption
      aligns,
      widths,
      pandoc.List(), -- headers
      { cells }
    )
    
    -- add it to the panel
    panel_content:insert(pandoc.utils.from_simple_table(panelTable))
  end

  local result = pandoc.Div({})
  result.content:extend(panel_content)

  if layout.float.caption_long then
    result.content:insert(pandoc.Para(quarto.utils.as_inlines(layout.float.caption_long) or {}))
  end

  local res = pandoc.Blocks({})
  panel_insert_preamble(res, layout.preamble)
  res:insert(result)
  
end
-- metainit.lua
-- All initialization functions that require access to metadata

function quarto_meta_init()
  return {
    Meta = function(meta)
      configure_filters()
      read_includes(meta)
      init_crossref_options(meta)
      initialize_custom_crossref_categories(meta)
      return meta
    end
  }
end
-- crossref.lua
-- Copyright (C) 2020-2023 Posit Software, PBC

-- this is the standalone version of our crossref filters, used in the IDEs for auto-completion

-- required version
PANDOC_VERSION:must_be_at_least '2.13'



initCrossrefIndex()

initShortcodeHandlers()

local quarto_init_filters = {
  { name = "init-quarto-meta-init", filter = quarto_meta_init() },
  { name = "init-quarto-custom-meta-init", filter = {
    Meta = function(meta)
      content_hidden_meta(meta)
    end
  }},
}

-- v1.4 change: quartoNormalize is responsible for producing a
-- "normalized" document that is ready for quarto-pre, etc.
-- notably, user filters will run on the normalized document and
-- see a "Quarto AST". For example, Figure nodes are no longer
-- going to be present, and will instead be represented by
-- our custom AST infrastructure (FloatRefTarget specifically).

local quarto_normalize_filters = {
  { name = "normalize", filter = filterIf(function()
    if quarto_global_state.active_filters == nil then
      return false
    end
    return quarto_global_state.active_filters.normalization
  end, normalize_filter()) },

  { name = "normalize-capture-reader-state", filter = normalize_capture_reader_state() },
}
tappend(quarto_normalize_filters, quarto_ast_pipeline())

local quarto_pre_filters = {
  -- quarto-pre

  { name = "flags", filter = compute_flags() },

  { name = "pre-shortcodes-filter", 
    filter = shortcodes_filter(),
    flags = { "has_shortcodes" } },
}

local quarto_crossref_filters = {

  { name = "crossref-preprocess-floats", filter = crossref_mark_subfloats(),
  },

  { name = "crossref-preprocessTheorems", 
    filter = crossref_preprocess_theorems(),
    flags = { "has_theorem_refs" } },

  { name = "crossref-combineFilters", filter = combineFilters({
    file_metadata(),
    qmd(),
    sections(),
    crossref_figures(),
    equations(),
    crossref_theorems(),
  })},

  { name = "crossref-resolveRefs", filter = resolveRefs(),
    flags = { "has_cites" } },
    
  { name = "crossref-crossrefMetaInject", filter = crossrefMetaInject() },
  { name = "crossref-writeIndex", filter = writeIndex() },
}

local filterList = {}

tappend(filterList, quarto_init_filters)
tappend(filterList, quarto_normalize_filters)
tappend(filterList, quarto_pre_filters)
tappend(filterList, quarto_crossref_filters)

local result = run_as_extended_ast({
  pre = {
    init_options()
  },
  afterFilterPass = function() 
    -- After filter pass is called after each pass through a filter group
    -- allowing state or other items to be handled
    resetFileMetadata()
  end,
  filters = filterList,
})

return result