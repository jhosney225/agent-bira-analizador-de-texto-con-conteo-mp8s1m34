
```javascript
import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";

const client = new Anthropic();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function analyzeText(text) {
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  const wordCount = words.length;

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = sentences.length;

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;

  const wordFrequency = {};
  words.forEach((word) => {
    const cleanWord = word.replace(/[^\w]/g, "");
    if (cleanWord.length > 0) {
      wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
    }
  });

  const sortedWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const averageWordLength =
    charactersNoSpaces > 0
      ? (charactersNoSpaces / wordCount).toFixed(2)
      : "0.00";
  const averageSentenceLength = (
    wordCount / sentenceCount
  ).toFixed(2);

  return {
    wordCount,
    sentenceCount,
    characters,
    charactersNoSpaces,
    averageWordLength,
    averageSentenceLength,
    topWords: sortedWords,
  };
}

async function getAIAnalysis(text, stats) {
  const prompt = `Analiza el siguiente texto y proporciona un resumen detallado de su contenido, estilo y características principales:

Texto:
"${text}"

Estadísticas del texto:
- Total de palabras: ${stats.wordCount}
- Total de oraciones: ${stats.sentenceCount}
- Caracteres totales: ${stats.characters}
- Caracteres sin espacios: ${stats.charactersNoSpaces}
- Longitud promedio de palabra: ${stats.averageWordLength}
- Longitud promedio de oración: ${stats.averageSentenceLength}

Palabras más frecuentes: ${stats.topWords.map((w) => `${w[0]} (${w[1]})`).join(", ")}

Por favor proporciona:
1. Un resumen del contenido principal
2. Análisis del tono y estilo
3. Temas principales identificados
4. Observaciones sobre la estructura y flujo`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}

function formatStats(stats) {
  let output = "\n=== ESTADÍSTICAS DEL TEXTO ===\n";
  output += `Palabras totales: ${stats.wordCount}\n`;
  output += `Oraciones totales: ${stats.sentenceCount}\n`;
  output += `Caracteres totales: ${stats.characters}\n`;
  output += `Caracteres (sin espacios): ${stats.charactersNoSpaces}\n`;
  output += `Longitud promedio de palabra: ${stats.averageWordLength} caracteres\n`;
  output += `Longitud promedio de oración: ${stats.averageSentenceLength} palabras\n`;

  output += "\n=== TOP 10 PALABRAS MÁS FRECUENTES ===\n";
  stats.topWords.forEach((word, index) => {
    output += `${index + 1}. "${word[0]}" - ${word[1]} veces\n`;
  });

  return output;
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║        ANALIZADOR DE TEXTO CON ESTADÍSTICAS              ║");
  console.log("║              Powered by Claude AI                         ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  console.log("Este programa analiza textos y proporciona:\n");
  console.log("✓ Conteo de palabras y oraciones");
  console.log("✓ Análisis de frecuencia de palabras");
  console.log("✓ Estadísticas de longitud y estructura");
  console.log("✓ Análisis profundo con inteligencia artificial\n");

  const demoText =
    "La inteligencia artificial está revolucionando la forma en que trabajamos y aprendemos. " +
    "Los modelos de lenguaje pueden procesar información compleja y generar respuestas coherentes. " +
    "Esta tecnología tiene aplicaciones en medicina, educación, negocios y muchos otros campos. " +
    "Sin embargo, también presentan desafíos éticos que debemos considerar cuidadosamente.";

  console.log("=== EJEMPLO DE ANÁLISIS ===\n");
  console.log("Texto de ejemplo:");
  console.log(`"${demoText}"\n`);

  console.log("Procesando análisis...\n");

  const stats = analyzeText(demoText);
  console.log(formatStats(stats));

  console.log("\n=== ANÁLISIS CON INTELIGENCIA ARTIFICIAL ===\n");
  