import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvFilePath = path.join(__dirname, 'questions_template.csv');
const jsonFilePath = path.join(__dirname, 'questions.json');

const csvToJson = (csv) => {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  // This regex handles comma-separated values that might be inside JSON strings within quotes
  const parseLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"' && line.indexOf(char) > 0 && line.indexOf(char) < line.length -1) { // simple check for quote that is not at the start/end
        if (line[line.indexOf(char)-1] !== '{' && line[line.indexOf(char)+1] !== '}') {
            inQuotes = !inQuotes;
        }
      }
      if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    return values.map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
  };

  const questions = lines.slice(1).map(line => {
    const values = parseLine(line);
    const obj = {};
    headers.forEach((header, index) => {
      let value = values[index] ? values[index].trim() : '';

      // Clean surrounding quotes if they are not part of a JSON structure
      if (value.startsWith('"') && value.endsWith('"')) {
           value = value.substring(1, value.length - 1).replace(/""/g, '"');
      }

      // Handle boolean, number, and JSON strings
      if (value.toLowerCase() === 'true') value = true;
      else if (value.toLowerCase() === 'false') value = false;
      else if (!isNaN(value) && value !== '' && !header.includes('id')) value = Number(value);
      else if (header.includes('options_')) {
          try {
              value = value ? JSON.parse(value) : [];
          } catch {
              console.warn(`Could not parse JSON for options: ${value}`);
              value = [];
          }
      }
      
      const keys = header.split('_');
      let currentLevel = obj;

      if (keys.length > 1 && (keys[0] === 'label' || keys[0] === 'description' || keys[0] === 'hint' || keys[0] === 'options')) {
          const lang = keys[1];
          if (!currentLevel.i18n) currentLevel.i18n = {};
          if (!currentLevel.i18n[lang]) currentLevel.i18n[lang] = {};
          currentLevel.i18n[lang][keys[0]] = value;

      } else if (keys[0] === 'required' || keys[0] === 'min' || keys[0] === 'max' || keys[0] === 'step' || keys[0] === 'pattern') {
        if (!currentLevel.validation) currentLevel.validation = {};
        if (value) currentLevel.validation[keys[0]] = value;

      } else if (keys[0] === 'show' && keys[1] === 'if') {
         if (value) {
            if (!currentLevel.branching) currentLevel.branching = {};
            currentLevel.branching.show_if = value;
         }
      } else {
          if (value || typeof value === 'boolean' || (typeof value === 'number' && value !== 0) ) {
            currentLevel[header] = value;
          }
      }
    });
    return obj;
  });

  const finalJson = {
    id: "vivaform-onboarding-v1",
    version: "1.0.0",
    sections: [
        { "id": "profile", "order": 1, "i18n": { "en": { "title": "Your Profile" }, "ru": {"title": "Ваш профиль" } } },
        { "id": "nutrition", "order": 2, "i18n": { "en": { "title": "Nutrition" }, "ru": {"title": "Питание" } } },
        { "id": "habits", "order": 3, "i18n": { "en": { "title": "Your Habits" }, "ru": {"title": "Ваши привычки" } } }
    ],
    questions: questions
  };

  return JSON.stringify(finalJson, null, 2);
};

fs.readFile(csvFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error("Error reading CSV file:", err);
    return;
  }
  const jsonResult = csvToJson(data);
  fs.writeFile(jsonFilePath, jsonResult, 'utf8', (err) => {
    if (err) {
      console.error("Error writing JSON file:", err);
    } else {
      console.log("Successfully converted CSV to JSON!");
    }
  });
});
