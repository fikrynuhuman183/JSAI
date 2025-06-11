import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from 'fs';

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "meta/Llama-4-Maverick-17B-128E-Instruct-FP8";

export async function main() {
  const client = ModelClient(
    endpoint,
    new AzureKeyCredential(token),
  );

  // Read and encode image to base64
  const imagePath = "./contoso_layout_sketch.jpg"; // Replace with your sketch image path
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = "image/jpeg"; // Adjust based on your image type

  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        { 
          role: "system", 
          content: "You are an expert frontend developer and designer. Analyze wireframe sketches and mockups to generate clean, modern HTML/CSS code. Focus on responsive design, semantic HTML, and modern CSS practices." 
        },
        { 
          role: "user", 
          content: [
            {
              type: "text",
              text: "Please analyze this wireframe/sketch and generate complete HTML and CSS code for a frontend webpage. Include:\n\n1. Semantic HTML structure\n2. Modern CSS with flexbox/grid\n3. Responsive design\n4. Clean, professional styling\n5. Proper spacing and typography\n\nProvide the complete code that I can save as an HTML file and open in a browser."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 2000,
      model: model
    }
  });

  if (isUnexpected(response)) {
    throw response.body.error;
  }

  const generatedCode = response.body.choices[0].message.content;
  console.log("Generated Frontend Code:");
  console.log("=" .repeat(50));
  console.log(generatedCode);
  
  // Optionally save the generated code to an HTML file
  const outputPath = "./generated-webpage.html";
  fs.writeFileSync(outputPath, generatedCode);
  console.log(`\nCode saved to: ${outputPath}`);
  console.log("You can now open this file in your browser!");
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});