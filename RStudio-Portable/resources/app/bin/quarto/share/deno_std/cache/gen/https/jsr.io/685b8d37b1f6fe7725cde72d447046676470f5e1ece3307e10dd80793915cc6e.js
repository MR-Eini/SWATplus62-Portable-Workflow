// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/*!
 * Ported and modified from: https://github.com/beatgammit/tar-js and
 * licensed as:
 *
 * (The MIT License)
 *
 * Copyright (c) 2011 T. Jameson Little
 * Copyright (c) 2019 Jun Kato
 * Copyright (c) 2018-2024 the Deno authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */ import { FileTypes, USTAR_STRUCTURE } from "./_common.ts";
import { MultiReader } from "jsr:/@std/io@^0.224.3/multi-reader";
import { Buffer } from "jsr:/@std/io@^0.224.3/buffer";
import { HEADER_LENGTH } from "./_common.ts";
const USTAR_MAGIC_HEADER = "ustar\u000000";
/**
 * Simple file reader
 */ class FileReader {
  #file;
  #filePath;
  constructor(filePath){
    this.#filePath = filePath;
  }
  async read(p) {
    if (!this.#file) {
      this.#file = await Deno.open(this.#filePath, {
        read: true
      });
    }
    const res = await this.#file.read(p);
    if (res === null) {
      this.#file.close();
      this.#file = undefined;
    }
    return res;
  }
}
/**
 * Pads a number with leading zeros to a specified number of bytes.
 *
 * @param num The number to pad.
 * @param bytes The number of bytes to pad the number to.
 * @returns The padded number as a string.
 */ function pad(num, bytes) {
  return num.toString(8).padStart(bytes, "0");
}
/**
 * Formats the header data for a tar file entry.
 *
 * @param data The data object containing the values for the tar header fields.
 * @returns The formatted header data as a Uint8Array.
 */ function formatHeader(data) {
  const encoder = new TextEncoder();
  const buffer = new Uint8Array(HEADER_LENGTH);
  let offset = 0;
  for (const { field, length } of USTAR_STRUCTURE){
    const entry = encoder.encode(data[field] || "");
    buffer.set(entry, offset);
    offset += length;
  }
  return buffer;
}
/**
 * ### Overview
 * A class to create a tar archive.  Tar archives allow for storing multiple files in a
 * single file (called an archive, or sometimes a tarball).  These archives typically
 * have the '.tar' extension.
 *
 * ### Usage
 * The workflow is to create a Tar instance, append files to it, and then write the
 * tar archive to the filesystem (or other output stream).  See the worked example
 * below for details.
 *
 * ### Compression
 * Tar archives are not compressed by default.  If you want to compress the archive,
 * you may compress the tar archive after creation, but this capability is not provided
 * here.
 *
 * ### File format and limitations
 *
 * The ustar file format is used for creating the archive file.
 * While this format is compatible with most tar readers,
 * the format has several limitations, including:
 * * Files must be smaller than 8GiB
 * * Filenames (including path) must be shorter than 256 characters
 * * Filenames (including path) cannot contain non-ASCII characters
 * * Sparse files are not supported
 *
 * @example
 * ```ts
 * import { Tar } from "@std/archive/tar";
 * import { Buffer } from "@std/io/buffer";
 * import { copy } from "@std/io/copy";
 *
 * const tar = new Tar();
 *
 * // Now that we've created our tar, let's add some files to it:
 *
 * const content = new TextEncoder().encode("Some arbitrary content");
 * await tar.append("deno.txt", {
 *   reader: new Buffer(content),
 *   contentSize: content.byteLength,
 * });
 *
 * // This file is sourced from the filesystem (and renamed in the archive)
 * await tar.append("filename_in_archive.txt", {
 *   filePath: "./filename_on_filesystem.txt",
 * });
 *
 * // Now let's write the tar (with it's two files) to the filesystem
 * // use tar.getReader() to read the contents.
 *
 * const writer = await Deno.open("./out.tar", { write: true, create: true });
 * await copy(tar.getReader(), writer);
 * writer.close();
 * ```
 */ export class Tar {
  /** Tar data. */ data;
  /** Constructs a new instance. */ constructor(){
    this.data = [];
  }
  /**
   * Append a file or reader of arbitrary content to this tar archive. Directories
   * appended to the archive append only the directory itself to the archive, not
   * its contents.  To add a directory and its contents, recursively append the
   * directory's contents.  Directories and subdirectories will be created automatically
   * in the archive as required.
   *
   * @param filenameInArchive File name of the content in the archive. E.g.
   * `test.txt`. Use slash for directory separators.
   * @param source Details of the source of the content including the
   * reference to the content itself and potentially any related metadata.
   */ async append(filenameInArchive, source) {
    if (typeof filenameInArchive !== "string") {
      throw new Error("file name not specified");
    }
    let fileName = filenameInArchive;
    /**
     * Ustar format has a limitation of file name length. Specifically:
     * 1. File names can contain at most 255 bytes.
     * 2. File names longer than 100 bytes must be split at a directory separator in two parts,
     * the first being at most 155 bytes long. So, in most cases file names must be a bit shorter
     * than 255 bytes.
     */ // separate file name into two parts if needed
    let fileNamePrefix;
    if (fileName.length > 100) {
      let i = fileName.length;
      while(i >= 0){
        i = fileName.lastIndexOf("/", i);
        if (i <= 155) {
          fileNamePrefix = fileName.slice(0, i);
          fileName = fileName.slice(i + 1);
          break;
        }
        i--;
      }
      const errMsg = "ustar format does not allow a long file name (length of [file name" + "prefix] + / + [file name] must be shorter than 256 bytes)";
      if (i < 0 || fileName.length > 100) {
        throw new Error(errMsg);
      } else {
        if (fileNamePrefix === undefined) {
          throw new TypeError("File name prefix is undefined");
        }
        if (fileNamePrefix.length > 155) {
          throw new Error(errMsg);
        }
      }
    }
    source = source || {};
    // set meta data
    let info;
    if (source.filePath) {
      info = await Deno.stat(source.filePath);
      if (info.isDirectory) {
        info.size = 0;
        source.reader = new Buffer();
      }
    }
    const mode = source.fileMode || info && info.mode || parseInt("777", 8) & 0xfff /* 511 */ ;
    const mtime = Math.floor(source.mtime ?? (info?.mtime ?? new Date()).valueOf() / 1000);
    const uid = source.uid || 0;
    const gid = source.gid || 0;
    if (typeof source.owner === "string" && source.owner.length >= 32) {
      throw new Error("ustar format does not allow owner name length >= 32 bytes");
    }
    if (typeof source.group === "string" && source.group.length >= 32) {
      throw new Error("ustar format does not allow group name length >= 32 bytes");
    }
    const fileSize = info?.size ?? source.contentSize;
    if (fileSize === undefined) {
      throw new TypeError("fileSize must be set");
    }
    const type = source.type ? FileTypes[source.type] : info?.isDirectory ? FileTypes.directory : FileTypes.file;
    const tarData = {
      fileName,
      fileNamePrefix,
      fileMode: pad(mode, 7),
      uid: pad(uid, 7),
      gid: pad(gid, 7),
      fileSize: pad(fileSize, 11),
      mtime: pad(mtime, 11),
      checksum: "        ",
      type: type.toString(),
      ustar: USTAR_MAGIC_HEADER,
      owner: source.owner || "",
      group: source.group || "",
      filePath: source.filePath,
      reader: source.reader
    };
    // calculate the checksum
    let checksum = 0;
    const encoder = new TextEncoder();
    Object.keys(tarData).filter((key)=>[
        "filePath",
        "reader"
      ].indexOf(key) < 0).forEach(function(key) {
      checksum += encoder.encode(tarData[key]).reduce((p, c)=>p + c, 0);
    });
    tarData.checksum = pad(checksum, 6) + "\u0000 ";
    this.data.push(tarData);
  }
  /**
   * Get a Reader instance for this tar archive.
   */ getReader() {
    const readers = [];
    this.data.forEach((tarData)=>{
      let { reader } = tarData;
      const { filePath } = tarData;
      const headerArr = formatHeader(tarData);
      readers.push(new Buffer(headerArr));
      if (!reader) {
        if (filePath === undefined) {
          throw new TypeError("filePath must be defined");
        }
        reader = new FileReader(filePath);
      }
      readers.push(reader);
      // to the nearest multiple of recordSize
      if (tarData.fileSize === undefined) {
        throw new TypeError("fileSize must be set");
      }
      readers.push(new Buffer(new Uint8Array(HEADER_LENGTH - (parseInt(tarData.fileSize, 8) % HEADER_LENGTH || HEADER_LENGTH))));
    });
    // append 2 empty records
    readers.push(new Buffer(new Uint8Array(HEADER_LENGTH * 2)));
    return new MultiReader(readers);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vanNyLmlvL0BzdGQvYXJjaGl2ZS8wLjIyNC4zL3Rhci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLyohXG4gKiBQb3J0ZWQgYW5kIG1vZGlmaWVkIGZyb206IGh0dHBzOi8vZ2l0aHViLmNvbS9iZWF0Z2FtbWl0L3Rhci1qcyBhbmRcbiAqIGxpY2Vuc2VkIGFzOlxuICpcbiAqIChUaGUgTUlUIExpY2Vuc2UpXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDExIFQuIEphbWVzb24gTGl0dGxlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTkgSnVuIEthdG9cbiAqIENvcHlyaWdodCAoYykgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnNcbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbiAqIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuICogVEhFIFNPRlRXQVJFLlxuICovXG5cbmltcG9ydCB7XG4gIEZpbGVUeXBlcyxcbiAgdHlwZSBUYXJJbmZvLFxuICB0eXBlIFRhck1ldGEsXG4gIFVTVEFSX1NUUlVDVFVSRSxcbn0gZnJvbSBcIi4vX2NvbW1vbi50c1wiO1xuaW1wb3J0IHR5cGUgeyBSZWFkZXIgfSBmcm9tIFwianNyOi9Ac3RkL2lvQF4wLjIyNC4zL3R5cGVzXCI7XG5pbXBvcnQgeyBNdWx0aVJlYWRlciB9IGZyb20gXCJqc3I6L0BzdGQvaW9AXjAuMjI0LjMvbXVsdGktcmVhZGVyXCI7XG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwianNyOi9Ac3RkL2lvQF4wLjIyNC4zL2J1ZmZlclwiO1xuaW1wb3J0IHsgSEVBREVSX0xFTkdUSCB9IGZyb20gXCIuL19jb21tb24udHNcIjtcblxuZXhwb3J0IHR5cGUgeyBUYXJJbmZvLCBUYXJNZXRhIH07XG5cbi8qKiBPcHRpb25zIGZvciB7QGxpbmtjb2RlIFRhci5hcHBlbmR9LiAqL1xuZXhwb3J0IGludGVyZmFjZSBUYXJPcHRpb25zIGV4dGVuZHMgVGFySW5mbyB7XG4gIC8qKlxuICAgKiBGaWxlcGF0aCBvZiB0aGUgZmlsZSB0byBhcHBlbmQgdG8gdGhlIGFyY2hpdmVcbiAgICovXG4gIGZpbGVQYXRoPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBIFJlYWRlciBvZiBhbnkgYXJiaXRyYXJ5IGNvbnRlbnQgdG8gYXBwZW5kIHRvIHRoZSBhcmNoaXZlXG4gICAqL1xuICByZWFkZXI/OiBSZWFkZXI7XG5cbiAgLyoqXG4gICAqIFNpemUgb2YgdGhlIGNvbnRlbnQgdG8gYmUgYXBwZW5kZWQuIFRoaXMgaXMgb25seSByZXF1aXJlZFxuICAgKiB3aGVuIHBhc3NpbmcgYSByZWFkZXIgdG8gdGhlIGFyY2hpdmUuXG4gICAqL1xuICBjb250ZW50U2l6ZT86IG51bWJlcjtcbn1cblxuY29uc3QgVVNUQVJfTUFHSUNfSEVBREVSID0gXCJ1c3RhclxcdTAwMDAwMFwiIGFzIGNvbnN0O1xuXG4vKipcbiAqIFNpbXBsZSBmaWxlIHJlYWRlclxuICovXG5jbGFzcyBGaWxlUmVhZGVyIGltcGxlbWVudHMgUmVhZGVyIHtcbiAgI2ZpbGU/OiBEZW5vLkZzRmlsZTtcbiAgI2ZpbGVQYXRoOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoZmlsZVBhdGg6IHN0cmluZykge1xuICAgIHRoaXMuI2ZpbGVQYXRoID0gZmlsZVBhdGg7XG4gIH1cblxuICBhc3luYyByZWFkKHA6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPG51bWJlciB8IG51bGw+IHtcbiAgICBpZiAoIXRoaXMuI2ZpbGUpIHtcbiAgICAgIHRoaXMuI2ZpbGUgPSBhd2FpdCBEZW5vLm9wZW4odGhpcy4jZmlsZVBhdGgsIHsgcmVhZDogdHJ1ZSB9KTtcbiAgICB9XG4gICAgY29uc3QgcmVzID0gYXdhaXQgdGhpcy4jZmlsZS5yZWFkKHApO1xuICAgIGlmIChyZXMgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuI2ZpbGUuY2xvc2UoKTtcbiAgICAgIHRoaXMuI2ZpbGUgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbn1cblxuLyoqXG4gKiBQYWRzIGEgbnVtYmVyIHdpdGggbGVhZGluZyB6ZXJvcyB0byBhIHNwZWNpZmllZCBudW1iZXIgb2YgYnl0ZXMuXG4gKlxuICogQHBhcmFtIG51bSBUaGUgbnVtYmVyIHRvIHBhZC5cbiAqIEBwYXJhbSBieXRlcyBUaGUgbnVtYmVyIG9mIGJ5dGVzIHRvIHBhZCB0aGUgbnVtYmVyIHRvLlxuICogQHJldHVybnMgVGhlIHBhZGRlZCBudW1iZXIgYXMgYSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIHBhZChudW06IG51bWJlciwgYnl0ZXM6IG51bWJlcik6IHN0cmluZyB7XG4gIHJldHVybiBudW0udG9TdHJpbmcoOCkucGFkU3RhcnQoYnl0ZXMsIFwiMFwiKTtcbn1cblxuLyoqXG4gKiBGb3JtYXRzIHRoZSBoZWFkZXIgZGF0YSBmb3IgYSB0YXIgZmlsZSBlbnRyeS5cbiAqXG4gKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSBvYmplY3QgY29udGFpbmluZyB0aGUgdmFsdWVzIGZvciB0aGUgdGFyIGhlYWRlciBmaWVsZHMuXG4gKiBAcmV0dXJucyBUaGUgZm9ybWF0dGVkIGhlYWRlciBkYXRhIGFzIGEgVWludDhBcnJheS5cbiAqL1xuZnVuY3Rpb24gZm9ybWF0SGVhZGVyKGRhdGE6IFRhckRhdGEpOiBVaW50OEFycmF5IHtcbiAgY29uc3QgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICBjb25zdCBidWZmZXIgPSBuZXcgVWludDhBcnJheShIRUFERVJfTEVOR1RIKTtcbiAgbGV0IG9mZnNldCA9IDA7XG4gIGZvciAoY29uc3QgeyBmaWVsZCwgbGVuZ3RoIH0gb2YgVVNUQVJfU1RSVUNUVVJFKSB7XG4gICAgY29uc3QgZW50cnkgPSBlbmNvZGVyLmVuY29kZShkYXRhW2ZpZWxkIGFzIGtleW9mIFRhckRhdGFdIHx8IFwiXCIpO1xuICAgIGJ1ZmZlci5zZXQoZW50cnksIG9mZnNldCk7XG4gICAgb2Zmc2V0ICs9IGxlbmd0aDtcbiAgfVxuICByZXR1cm4gYnVmZmVyO1xufVxuXG4vKiogQmFzZSBpbnRlcmZhY2UgZm9yIHtAbGlua2NvZGUgVGFyRGF0YVdpdGhTb3VyY2V9LiAqL1xuZXhwb3J0IGludGVyZmFjZSBUYXJEYXRhIHtcbiAgLyoqIE5hbWUgb2YgdGhlIGZpbGUsIGV4Y2x1ZGluZyBkaXJlY3RvcnkgbmFtZXMgKGlmIGFueSkuICovXG4gIGZpbGVOYW1lPzogc3RyaW5nO1xuICAvKiogRGlyZWN0b3J5IG5hbWVzIHByZWNlZGluZyB0aGUgZmlsZSBuYW1lIChpZiBhbnkpLiAqL1xuICBmaWxlTmFtZVByZWZpeD86IHN0cmluZztcbiAgLyoqXG4gICAqIFRoZSB1bmRlcmx5aW5nIHJhdyBgc3RfbW9kZWAgYml0cyB0aGF0IGNvbnRhaW4gdGhlIHN0YW5kYXJkIFVuaXhcbiAgICogcGVybWlzc2lvbnMgZm9yIHRoaXMgZmlsZS9kaXJlY3RvcnkuXG4gICAqL1xuICBmaWxlTW9kZT86IHN0cmluZztcbiAgLyoqXG4gICAqIE51bWVyaWMgdXNlciBJRCBvZiB0aGUgZmlsZSBvd25lci4gVGhpcyBpcyBpZ25vcmVkIGlmIHRoZSBvcGVyYXRpbmcgc3lzdGVtXG4gICAqIGRvZXMgbm90IHN1cHBvcnQgbnVtZXJpYyB1c2VyIElEcy5cbiAgICovXG4gIHVpZD86IHN0cmluZztcbiAgLyoqXG4gICAqIE51bWVyaWMgZ3JvdXAgSUQgb2YgdGhlIGZpbGUgb3duZXIuIFRoaXMgaXMgaWdub3JlZCBpZiB0aGUgb3BlcmF0aW5nXG4gICAqIHN5c3RlbSBkb2VzIG5vdCBzdXBwb3J0IG51bWVyaWMgZ3JvdXAgSURzLlxuICAgKi9cbiAgZ2lkPzogc3RyaW5nO1xuICAvKipcbiAgICogVGhlIHNpemUgb2YgdGhlIGZpbGUgaW4gYnl0ZXM7IGZvciBhcmNoaXZlIG1lbWJlcnMgdGhhdCBhcmUgc3ltYm9saWMgb3JcbiAgICogaGFyZCBsaW5rcyB0byBhbm90aGVyIGZpbGUsIHRoaXMgZmllbGQgaXMgc3BlY2lmaWVkIGFzIHplcm8uXG4gICAqL1xuICBmaWxlU2l6ZT86IHN0cmluZztcbiAgLyoqXG4gICAqIERhdGEgbW9kaWZpY2F0aW9uIHRpbWUgb2YgdGhlIGZpbGUgYXQgdGhlIHRpbWUgaXQgd2FzIGFyY2hpdmVkLiBJdFxuICAgKiByZXByZXNlbnRzIHRoZSBpbnRlZ2VyIG51bWJlciBvZiBzZWNvbmRzIHNpbmNlIEphbnVhcnkgMSwgMTk3MCwgMDA6MDAgVVRDLlxuICAgKi9cbiAgbXRpbWU/OiBzdHJpbmc7XG4gIC8qKiBUaGUgc2ltcGxlIHN1bSBvZiBhbGwgYnl0ZXMgaW4gdGhlIGhlYWRlciBibG9jayAqL1xuICBjaGVja3N1bT86IHN0cmluZztcbiAgLyoqXG4gICAqIFRoZSB0eXBlIG9mIGZpbGUgYXJjaGl2ZWQuXG4gICAqXG4gICAqIEBzZWUge0BsaW5rY29kZSBGaWxlVHlwZXN9XG4gICAqL1xuICB0eXBlPzogc3RyaW5nO1xuICAvKiogVXN0YXIgbWFnaWMgaGVhZGVyICovXG4gIHVzdGFyPzogc3RyaW5nO1xuICAvKiogVGhlIG5hbWUgb2YgdGhlIGZpbGUgb3duZXIuICovXG4gIG93bmVyPzogc3RyaW5nO1xuICAvKiogVGhlIGdyb3VwIHRoYXQgdGhlIGZpbGUgb3duZXIgYmVsb25ncyB0by4gKi9cbiAgZ3JvdXA/OiBzdHJpbmc7XG59XG5cbi8qKiBUYXIgZGF0YSBpbnRlcmZhY2UgZm9yIHtAbGlua2NvZGUgVGFyLmRhdGF9LiAqL1xuZXhwb3J0IGludGVyZmFjZSBUYXJEYXRhV2l0aFNvdXJjZSBleHRlbmRzIFRhckRhdGEge1xuICAvKipcbiAgICogUGF0aCBvZiB0aGUgZmlsZSB0byByZWFkLlxuICAgKi9cbiAgZmlsZVBhdGg/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBCdWZmZXIgcmVhZGVyLlxuICAgKi9cbiAgcmVhZGVyPzogUmVhZGVyO1xufVxuXG4vKipcbiAqICMjIyBPdmVydmlld1xuICogQSBjbGFzcyB0byBjcmVhdGUgYSB0YXIgYXJjaGl2ZS4gIFRhciBhcmNoaXZlcyBhbGxvdyBmb3Igc3RvcmluZyBtdWx0aXBsZSBmaWxlcyBpbiBhXG4gKiBzaW5nbGUgZmlsZSAoY2FsbGVkIGFuIGFyY2hpdmUsIG9yIHNvbWV0aW1lcyBhIHRhcmJhbGwpLiAgVGhlc2UgYXJjaGl2ZXMgdHlwaWNhbGx5XG4gKiBoYXZlIHRoZSAnLnRhcicgZXh0ZW5zaW9uLlxuICpcbiAqICMjIyBVc2FnZVxuICogVGhlIHdvcmtmbG93IGlzIHRvIGNyZWF0ZSBhIFRhciBpbnN0YW5jZSwgYXBwZW5kIGZpbGVzIHRvIGl0LCBhbmQgdGhlbiB3cml0ZSB0aGVcbiAqIHRhciBhcmNoaXZlIHRvIHRoZSBmaWxlc3lzdGVtIChvciBvdGhlciBvdXRwdXQgc3RyZWFtKS4gIFNlZSB0aGUgd29ya2VkIGV4YW1wbGVcbiAqIGJlbG93IGZvciBkZXRhaWxzLlxuICpcbiAqICMjIyBDb21wcmVzc2lvblxuICogVGFyIGFyY2hpdmVzIGFyZSBub3QgY29tcHJlc3NlZCBieSBkZWZhdWx0LiAgSWYgeW91IHdhbnQgdG8gY29tcHJlc3MgdGhlIGFyY2hpdmUsXG4gKiB5b3UgbWF5IGNvbXByZXNzIHRoZSB0YXIgYXJjaGl2ZSBhZnRlciBjcmVhdGlvbiwgYnV0IHRoaXMgY2FwYWJpbGl0eSBpcyBub3QgcHJvdmlkZWRcbiAqIGhlcmUuXG4gKlxuICogIyMjIEZpbGUgZm9ybWF0IGFuZCBsaW1pdGF0aW9uc1xuICpcbiAqIFRoZSB1c3RhciBmaWxlIGZvcm1hdCBpcyB1c2VkIGZvciBjcmVhdGluZyB0aGUgYXJjaGl2ZSBmaWxlLlxuICogV2hpbGUgdGhpcyBmb3JtYXQgaXMgY29tcGF0aWJsZSB3aXRoIG1vc3QgdGFyIHJlYWRlcnMsXG4gKiB0aGUgZm9ybWF0IGhhcyBzZXZlcmFsIGxpbWl0YXRpb25zLCBpbmNsdWRpbmc6XG4gKiAqIEZpbGVzIG11c3QgYmUgc21hbGxlciB0aGFuIDhHaUJcbiAqICogRmlsZW5hbWVzIChpbmNsdWRpbmcgcGF0aCkgbXVzdCBiZSBzaG9ydGVyIHRoYW4gMjU2IGNoYXJhY3RlcnNcbiAqICogRmlsZW5hbWVzIChpbmNsdWRpbmcgcGF0aCkgY2Fubm90IGNvbnRhaW4gbm9uLUFTQ0lJIGNoYXJhY3RlcnNcbiAqICogU3BhcnNlIGZpbGVzIGFyZSBub3Qgc3VwcG9ydGVkXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBUYXIgfSBmcm9tIFwiQHN0ZC9hcmNoaXZlL3RhclwiO1xuICogaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcIkBzdGQvaW8vYnVmZmVyXCI7XG4gKiBpbXBvcnQgeyBjb3B5IH0gZnJvbSBcIkBzdGQvaW8vY29weVwiO1xuICpcbiAqIGNvbnN0IHRhciA9IG5ldyBUYXIoKTtcbiAqXG4gKiAvLyBOb3cgdGhhdCB3ZSd2ZSBjcmVhdGVkIG91ciB0YXIsIGxldCdzIGFkZCBzb21lIGZpbGVzIHRvIGl0OlxuICpcbiAqIGNvbnN0IGNvbnRlbnQgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoXCJTb21lIGFyYml0cmFyeSBjb250ZW50XCIpO1xuICogYXdhaXQgdGFyLmFwcGVuZChcImRlbm8udHh0XCIsIHtcbiAqICAgcmVhZGVyOiBuZXcgQnVmZmVyKGNvbnRlbnQpLFxuICogICBjb250ZW50U2l6ZTogY29udGVudC5ieXRlTGVuZ3RoLFxuICogfSk7XG4gKlxuICogLy8gVGhpcyBmaWxlIGlzIHNvdXJjZWQgZnJvbSB0aGUgZmlsZXN5c3RlbSAoYW5kIHJlbmFtZWQgaW4gdGhlIGFyY2hpdmUpXG4gKiBhd2FpdCB0YXIuYXBwZW5kKFwiZmlsZW5hbWVfaW5fYXJjaGl2ZS50eHRcIiwge1xuICogICBmaWxlUGF0aDogXCIuL2ZpbGVuYW1lX29uX2ZpbGVzeXN0ZW0udHh0XCIsXG4gKiB9KTtcbiAqXG4gKiAvLyBOb3cgbGV0J3Mgd3JpdGUgdGhlIHRhciAod2l0aCBpdCdzIHR3byBmaWxlcykgdG8gdGhlIGZpbGVzeXN0ZW1cbiAqIC8vIHVzZSB0YXIuZ2V0UmVhZGVyKCkgdG8gcmVhZCB0aGUgY29udGVudHMuXG4gKlxuICogY29uc3Qgd3JpdGVyID0gYXdhaXQgRGVuby5vcGVuKFwiLi9vdXQudGFyXCIsIHsgd3JpdGU6IHRydWUsIGNyZWF0ZTogdHJ1ZSB9KTtcbiAqIGF3YWl0IGNvcHkodGFyLmdldFJlYWRlcigpLCB3cml0ZXIpO1xuICogd3JpdGVyLmNsb3NlKCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFRhciB7XG4gIC8qKiBUYXIgZGF0YS4gKi9cbiAgZGF0YTogVGFyRGF0YVdpdGhTb3VyY2VbXTtcblxuICAvKiogQ29uc3RydWN0cyBhIG5ldyBpbnN0YW5jZS4gKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5kYXRhID0gW107XG4gIH1cblxuICAvKipcbiAgICogQXBwZW5kIGEgZmlsZSBvciByZWFkZXIgb2YgYXJiaXRyYXJ5IGNvbnRlbnQgdG8gdGhpcyB0YXIgYXJjaGl2ZS4gRGlyZWN0b3JpZXNcbiAgICogYXBwZW5kZWQgdG8gdGhlIGFyY2hpdmUgYXBwZW5kIG9ubHkgdGhlIGRpcmVjdG9yeSBpdHNlbGYgdG8gdGhlIGFyY2hpdmUsIG5vdFxuICAgKiBpdHMgY29udGVudHMuICBUbyBhZGQgYSBkaXJlY3RvcnkgYW5kIGl0cyBjb250ZW50cywgcmVjdXJzaXZlbHkgYXBwZW5kIHRoZVxuICAgKiBkaXJlY3RvcnkncyBjb250ZW50cy4gIERpcmVjdG9yaWVzIGFuZCBzdWJkaXJlY3RvcmllcyB3aWxsIGJlIGNyZWF0ZWQgYXV0b21hdGljYWxseVxuICAgKiBpbiB0aGUgYXJjaGl2ZSBhcyByZXF1aXJlZC5cbiAgICpcbiAgICogQHBhcmFtIGZpbGVuYW1lSW5BcmNoaXZlIEZpbGUgbmFtZSBvZiB0aGUgY29udGVudCBpbiB0aGUgYXJjaGl2ZS4gRS5nLlxuICAgKiBgdGVzdC50eHRgLiBVc2Ugc2xhc2ggZm9yIGRpcmVjdG9yeSBzZXBhcmF0b3JzLlxuICAgKiBAcGFyYW0gc291cmNlIERldGFpbHMgb2YgdGhlIHNvdXJjZSBvZiB0aGUgY29udGVudCBpbmNsdWRpbmcgdGhlXG4gICAqIHJlZmVyZW5jZSB0byB0aGUgY29udGVudCBpdHNlbGYgYW5kIHBvdGVudGlhbGx5IGFueSByZWxhdGVkIG1ldGFkYXRhLlxuICAgKi9cbiAgYXN5bmMgYXBwZW5kKGZpbGVuYW1lSW5BcmNoaXZlOiBzdHJpbmcsIHNvdXJjZTogVGFyT3B0aW9ucykge1xuICAgIGlmICh0eXBlb2YgZmlsZW5hbWVJbkFyY2hpdmUgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImZpbGUgbmFtZSBub3Qgc3BlY2lmaWVkXCIpO1xuICAgIH1cbiAgICBsZXQgZmlsZU5hbWUgPSBmaWxlbmFtZUluQXJjaGl2ZTtcblxuICAgIC8qKlxuICAgICAqIFVzdGFyIGZvcm1hdCBoYXMgYSBsaW1pdGF0aW9uIG9mIGZpbGUgbmFtZSBsZW5ndGguIFNwZWNpZmljYWxseTpcbiAgICAgKiAxLiBGaWxlIG5hbWVzIGNhbiBjb250YWluIGF0IG1vc3QgMjU1IGJ5dGVzLlxuICAgICAqIDIuIEZpbGUgbmFtZXMgbG9uZ2VyIHRoYW4gMTAwIGJ5dGVzIG11c3QgYmUgc3BsaXQgYXQgYSBkaXJlY3Rvcnkgc2VwYXJhdG9yIGluIHR3byBwYXJ0cyxcbiAgICAgKiB0aGUgZmlyc3QgYmVpbmcgYXQgbW9zdCAxNTUgYnl0ZXMgbG9uZy4gU28sIGluIG1vc3QgY2FzZXMgZmlsZSBuYW1lcyBtdXN0IGJlIGEgYml0IHNob3J0ZXJcbiAgICAgKiB0aGFuIDI1NSBieXRlcy5cbiAgICAgKi9cbiAgICAvLyBzZXBhcmF0ZSBmaWxlIG5hbWUgaW50byB0d28gcGFydHMgaWYgbmVlZGVkXG4gICAgbGV0IGZpbGVOYW1lUHJlZml4OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgaWYgKGZpbGVOYW1lLmxlbmd0aCA+IDEwMCkge1xuICAgICAgbGV0IGkgPSBmaWxlTmFtZS5sZW5ndGg7XG4gICAgICB3aGlsZSAoaSA+PSAwKSB7XG4gICAgICAgIGkgPSBmaWxlTmFtZS5sYXN0SW5kZXhPZihcIi9cIiwgaSk7XG4gICAgICAgIGlmIChpIDw9IDE1NSkge1xuICAgICAgICAgIGZpbGVOYW1lUHJlZml4ID0gZmlsZU5hbWUuc2xpY2UoMCwgaSk7XG4gICAgICAgICAgZmlsZU5hbWUgPSBmaWxlTmFtZS5zbGljZShpICsgMSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaS0tO1xuICAgICAgfVxuICAgICAgY29uc3QgZXJyTXNnID1cbiAgICAgICAgXCJ1c3RhciBmb3JtYXQgZG9lcyBub3QgYWxsb3cgYSBsb25nIGZpbGUgbmFtZSAobGVuZ3RoIG9mIFtmaWxlIG5hbWVcIiArXG4gICAgICAgIFwicHJlZml4XSArIC8gKyBbZmlsZSBuYW1lXSBtdXN0IGJlIHNob3J0ZXIgdGhhbiAyNTYgYnl0ZXMpXCI7XG4gICAgICBpZiAoaSA8IDAgfHwgZmlsZU5hbWUubGVuZ3RoID4gMTAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJNc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGZpbGVOYW1lUHJlZml4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmlsZSBuYW1lIHByZWZpeCBpcyB1bmRlZmluZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbGVOYW1lUHJlZml4Lmxlbmd0aCA+IDE1NSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJNc2cpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgc291cmNlID0gc291cmNlIHx8IHt9O1xuXG4gICAgLy8gc2V0IG1ldGEgZGF0YVxuICAgIGxldCBpbmZvOiBEZW5vLkZpbGVJbmZvIHwgdW5kZWZpbmVkO1xuICAgIGlmIChzb3VyY2UuZmlsZVBhdGgpIHtcbiAgICAgIGluZm8gPSBhd2FpdCBEZW5vLnN0YXQoc291cmNlLmZpbGVQYXRoKTtcbiAgICAgIGlmIChpbmZvLmlzRGlyZWN0b3J5KSB7XG4gICAgICAgIGluZm8uc2l6ZSA9IDA7XG4gICAgICAgIHNvdXJjZS5yZWFkZXIgPSBuZXcgQnVmZmVyKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbW9kZSA9IHNvdXJjZS5maWxlTW9kZSB8fCAoaW5mbyAmJiBpbmZvLm1vZGUpIHx8XG4gICAgICBwYXJzZUludChcIjc3N1wiLCA4KSAmIDB4ZmZmIC8qIDUxMSAqLztcbiAgICBjb25zdCBtdGltZSA9IE1hdGguZmxvb3IoXG4gICAgICBzb3VyY2UubXRpbWUgPz8gKGluZm8/Lm10aW1lID8/IG5ldyBEYXRlKCkpLnZhbHVlT2YoKSAvIDEwMDAsXG4gICAgKTtcbiAgICBjb25zdCB1aWQgPSBzb3VyY2UudWlkIHx8IDA7XG4gICAgY29uc3QgZ2lkID0gc291cmNlLmdpZCB8fCAwO1xuXG4gICAgaWYgKHR5cGVvZiBzb3VyY2Uub3duZXIgPT09IFwic3RyaW5nXCIgJiYgc291cmNlLm93bmVyLmxlbmd0aCA+PSAzMikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBcInVzdGFyIGZvcm1hdCBkb2VzIG5vdCBhbGxvdyBvd25lciBuYW1lIGxlbmd0aCA+PSAzMiBieXRlc1wiLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBzb3VyY2UuZ3JvdXAgPT09IFwic3RyaW5nXCIgJiYgc291cmNlLmdyb3VwLmxlbmd0aCA+PSAzMikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBcInVzdGFyIGZvcm1hdCBkb2VzIG5vdCBhbGxvdyBncm91cCBuYW1lIGxlbmd0aCA+PSAzMiBieXRlc1wiLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlU2l6ZSA9IGluZm8/LnNpemUgPz8gc291cmNlLmNvbnRlbnRTaXplO1xuICAgIGlmIChmaWxlU2l6ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiZmlsZVNpemUgbXVzdCBiZSBzZXRcIik7XG4gICAgfVxuXG4gICAgY29uc3QgdHlwZSA9IHNvdXJjZS50eXBlXG4gICAgICA/IEZpbGVUeXBlc1tzb3VyY2UudHlwZSBhcyBrZXlvZiB0eXBlb2YgRmlsZVR5cGVzXVxuICAgICAgOiAoaW5mbz8uaXNEaXJlY3RvcnkgPyBGaWxlVHlwZXMuZGlyZWN0b3J5IDogRmlsZVR5cGVzLmZpbGUpO1xuICAgIGNvbnN0IHRhckRhdGE6IFRhckRhdGFXaXRoU291cmNlID0ge1xuICAgICAgZmlsZU5hbWUsXG4gICAgICBmaWxlTmFtZVByZWZpeCxcbiAgICAgIGZpbGVNb2RlOiBwYWQobW9kZSwgNyksXG4gICAgICB1aWQ6IHBhZCh1aWQsIDcpLFxuICAgICAgZ2lkOiBwYWQoZ2lkLCA3KSxcbiAgICAgIGZpbGVTaXplOiBwYWQoZmlsZVNpemUsIDExKSxcbiAgICAgIG10aW1lOiBwYWQobXRpbWUsIDExKSxcbiAgICAgIGNoZWNrc3VtOiBcIiAgICAgICAgXCIsXG4gICAgICB0eXBlOiB0eXBlLnRvU3RyaW5nKCksXG4gICAgICB1c3RhcjogVVNUQVJfTUFHSUNfSEVBREVSLFxuICAgICAgb3duZXI6IHNvdXJjZS5vd25lciB8fCBcIlwiLFxuICAgICAgZ3JvdXA6IHNvdXJjZS5ncm91cCB8fCBcIlwiLFxuICAgICAgZmlsZVBhdGg6IHNvdXJjZS5maWxlUGF0aCxcbiAgICAgIHJlYWRlcjogc291cmNlLnJlYWRlcixcbiAgICB9O1xuXG4gICAgLy8gY2FsY3VsYXRlIHRoZSBjaGVja3N1bVxuICAgIGxldCBjaGVja3N1bSA9IDA7XG4gICAgY29uc3QgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIE9iamVjdC5rZXlzKHRhckRhdGEpXG4gICAgICAuZmlsdGVyKChrZXkpOiBib29sZWFuID0+IFtcImZpbGVQYXRoXCIsIFwicmVhZGVyXCJdLmluZGV4T2Yoa2V5KSA8IDApXG4gICAgICAuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGNoZWNrc3VtICs9IGVuY29kZXJcbiAgICAgICAgICAuZW5jb2RlKHRhckRhdGFba2V5IGFzIGtleW9mIFRhckRhdGFdKVxuICAgICAgICAgIC5yZWR1Y2UoKHAsIGMpOiBudW1iZXIgPT4gcCArIGMsIDApO1xuICAgICAgfSk7XG5cbiAgICB0YXJEYXRhLmNoZWNrc3VtID0gcGFkKGNoZWNrc3VtLCA2KSArIFwiXFx1MDAwMCBcIjtcbiAgICB0aGlzLmRhdGEucHVzaCh0YXJEYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBSZWFkZXIgaW5zdGFuY2UgZm9yIHRoaXMgdGFyIGFyY2hpdmUuXG4gICAqL1xuICBnZXRSZWFkZXIoKTogUmVhZGVyIHtcbiAgICBjb25zdCByZWFkZXJzOiBSZWFkZXJbXSA9IFtdO1xuICAgIHRoaXMuZGF0YS5mb3JFYWNoKCh0YXJEYXRhKSA9PiB7XG4gICAgICBsZXQgeyByZWFkZXIgfSA9IHRhckRhdGE7XG4gICAgICBjb25zdCB7IGZpbGVQYXRoIH0gPSB0YXJEYXRhO1xuICAgICAgY29uc3QgaGVhZGVyQXJyID0gZm9ybWF0SGVhZGVyKHRhckRhdGEpO1xuICAgICAgcmVhZGVycy5wdXNoKG5ldyBCdWZmZXIoaGVhZGVyQXJyKSk7XG4gICAgICBpZiAoIXJlYWRlcikge1xuICAgICAgICBpZiAoZmlsZVBhdGggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJmaWxlUGF0aCBtdXN0IGJlIGRlZmluZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoZmlsZVBhdGgpO1xuICAgICAgfVxuICAgICAgcmVhZGVycy5wdXNoKHJlYWRlcik7XG5cbiAgICAgIC8vIHRvIHRoZSBuZWFyZXN0IG11bHRpcGxlIG9mIHJlY29yZFNpemVcbiAgICAgIGlmICh0YXJEYXRhLmZpbGVTaXplID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImZpbGVTaXplIG11c3QgYmUgc2V0XCIpO1xuICAgICAgfVxuICAgICAgcmVhZGVycy5wdXNoKFxuICAgICAgICBuZXcgQnVmZmVyKFxuICAgICAgICAgIG5ldyBVaW50OEFycmF5KFxuICAgICAgICAgICAgSEVBREVSX0xFTkdUSCAtXG4gICAgICAgICAgICAgIChwYXJzZUludCh0YXJEYXRhLmZpbGVTaXplLCA4KSAlIEhFQURFUl9MRU5HVEggfHwgSEVBREVSX0xFTkdUSCksXG4gICAgICAgICAgKSxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICAvLyBhcHBlbmQgMiBlbXB0eSByZWNvcmRzXG4gICAgcmVhZGVycy5wdXNoKG5ldyBCdWZmZXIobmV3IFVpbnQ4QXJyYXkoSEVBREVSX0xFTkdUSCAqIDIpKSk7XG4gICAgcmV0dXJuIG5ldyBNdWx0aVJlYWRlcihyZWFkZXJzKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBMkJDLEdBRUQsU0FDRSxTQUFTLEVBR1QsZUFBZSxRQUNWLGVBQWU7QUFFdEIsU0FBUyxXQUFXLFFBQVEscUNBQXFDO0FBQ2pFLFNBQVMsTUFBTSxRQUFRLCtCQUErQjtBQUN0RCxTQUFTLGFBQWEsUUFBUSxlQUFlO0FBdUI3QyxNQUFNLHFCQUFxQjtBQUUzQjs7Q0FFQyxHQUNELE1BQU07RUFDSixDQUFBLElBQUssQ0FBZTtFQUNwQixDQUFBLFFBQVMsQ0FBUztFQUVsQixZQUFZLFFBQWdCLENBQUU7SUFDNUIsSUFBSSxDQUFDLENBQUEsUUFBUyxHQUFHO0VBQ25CO0VBRUEsTUFBTSxLQUFLLENBQWEsRUFBMEI7SUFDaEQsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBLElBQUssRUFBRTtNQUNmLElBQUksQ0FBQyxDQUFBLElBQUssR0FBRyxN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
// denoCacheMetadata=13147043144705580895,16587601866047244706