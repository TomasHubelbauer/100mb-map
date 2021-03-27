import 'https://tomashubelbauer.github.io/esm-dataview-getvarint/index.js';

// TODO: Rework this API so that it can do random ranged access of the PBF file
// https://developers.google.com/protocol-buffers/docs/encoding
// https://wiki.openstreetmap.org/wiki/PBF_Format
// https://protogen.marcgravell.com/decode
// https://github.com/protobuf-net/protobuf-net
// https://github.com/marook/osm-read/blob/master/lib/pbfParser.js
export default function* parse(/** @type {DataView} */ dataView) {
  let index = 0;
  while (index < dataView.byteLength) {
    const byte = dataView.getUint8(index);
    index++;

    // https://developers.google.com/protocol-buffers/docs/encoding#structure
    const fieldNumber = ((byte & 128) / 8) + ((byte & 64) / 8) + ((byte & 32) / 8) + ((byte & 16) / 8) + ((byte & 8) / 8);
    const wireType = (byte & 4) + (byte & 2) + (byte & 1);
    switch (wireType) {
      // Varint
      case 0: {
        const varint = dataView.getVarint(index);
        yield { wireType: 'varint', fieldNumber, index, byteLength: varint.byteLength, valueRaw: varint.value, valueZigZag: 'todo' };
        index += varint.byteLength;
        break;
      }

      // 64-bit
      case 1: {
        yield { wireType: '64-bit', fieldNumber, index };
        throw new Error('64-bit is not implemented yet');
      }

      // Length-delimited
      case 2: {
        const lengthVarint = dataView.getVarint(index);
        if (lengthVarint.value > dataView.byteLength - index) {
          // This most commonly happens when a payload of a length-delimited field is tested to see if valid Protobuf
          // but the test returns a false positive (valid bytes but invalid semantically - like this overflow)
          throw new Error('Appears to be a mis-identified embedded message.');
        }

        const arrayBuffer = dataView.buffer;
        const byteOffset = dataView.byteOffset + index + lengthVarint.byteLength;
        const byteLength = lengthVarint.value;

        const payload = new Uint8Array(arrayBuffer, byteOffset, byteLength);
        let text;

        try {
          // https://stackoverflow.com/a/17192845/2715716
          text = decodeURIComponent(escape(String.fromCharCode(...payload)));
        } catch (error) {
          try {
            text = String.fromCharCode(...payload);
          } catch (error) {
            // Maximum callstack size exceeded? Too long payload for `String.fromCharCode`?
          }
        }

        // Test if this is an embedded message
        try {
          const dataView = new DataView(arrayBuffer, byteOffset, byteLength);
          const embedded = [...parse(dataView)];
          yield { wireType: 'length-delimited', fieldNumber, index, length: lengthVarint.value, payload, text, embedded };
        } catch (error) {
          // No valid Protobuf was found in the length-delimited payload so this is probably not an embedded message
          yield { wireType: 'length-delimited', fieldNumber, index, length: lengthVarint.value, payload, text };
        }

        index += lengthVarint.byteLength + lengthVarint.value;
        break;
      }

      // Start group
      case 3: {
        yield { wireType: 'start-group', fieldNumber, index };
        throw new Error('Start group is not implemented yet');
      }

      // End group
      case 4: {
        yield { wireType: 'end-group', fieldNumber, index };
        throw new Error('End group is not implemented yet');
      }

      // 32-bit
      case 5: {
        yield { wireType: '32-bit', fieldNumber, index };
        throw new Error('32-bit is not implemented yet');
      }

      default: {
        throw new Error(`Unknown wire type ${wireType} at index ${index} (${dataView.byteOffset + index}).`);
      }
    }
  }
}
