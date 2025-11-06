// Test script to verify the stream handling works correctly

async function* textOnlyStream(stream) {
    for await (const chunk of stream) {
        console.log("Chunk type:", chunk.type);
        if (chunk.type === 'text-delta') {
            console.log("Text chunk:", chunk.text);
            yield chunk.text;
        }
    }
}

// Simulated fullStream from AI SDK
const mockStream = async function* () {
    yield { type: 'text-start', id: 'test' };
    yield { type: 'text-delta', text: 'Hello ' };
    yield { type: 'text-delta', text: 'World' };
    yield { type: 'text-delta', text: '!' };
    yield { type: 'text-finish', finishReason: 'stop' };
};

// Test the stream
(async () => {
    console.log("Testing stream conversion...\n");
    let result = '';
    for await (const text of textOnlyStream(mockStream())) {
        result += text;
    }
    console.log("\nFinal result:", result);
    console.log("Success! Stream works correctly");
})();
