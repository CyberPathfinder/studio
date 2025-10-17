
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Analytics Setup

This project is configured to support Google Analytics (GA4) and Meta Pixel tracking. To enable them, create a `.env.local` file in the root of your project and add the following environment variables:

```bash
# .env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=0000000000000
```

Replace the placeholder values with your actual tracking IDs. The application will automatically detect these variables and enable the respective analytics scripts. Events are logged to the browser console in development mode for easy debugging.

## Quiz Engine: Managing Questions

The quiz is powered by a JSON configuration file located at `src/data/questions.json`. This allows for easy updates to questions, sections, and logic without changing the application code.

### How to Add or Translate Questions

The easiest way to manage questions is by editing the CSV template located at `src/data/questions_template.csv` and then running the conversion script.

1.  **Edit the CSV**: Open `src/data/questions_template.csv` in a spreadsheet editor.
    *   **Add a question**: Add a new row and fill in the columns.
    *   **Translate a question**: Fill in the `label_ru`, `description_ru`, `hint_ru`, and `options_ru` columns for the desired question.
2.  **Run the Converter**: After saving your CSV changes, run the following command from your project root:
    ```bash
    node src/data/csv-to-json.mjs
    ```
    This will automatically update the `src/data/questions.json` file.

### How Branching Logic Works

The `show_if` column in the CSV (which becomes the `branching.show_if` key in the JSON) controls whether a question is displayed.

*   **It's a JavaScript expression**: The value is a string that will be evaluated as a JavaScript boolean expression.
*   **Accessing Answers**: You have access to a special object called `answers`. You can access the value of any previous question by its `id`.

**Example:**

A question with the following `show_if` value will *only* be displayed if the user's answer to the question with the `id` "primary_goal" was exactly "lose_weight".

```
answers['primary_goal'] === 'lose_weight'
```

You can create more complex logic using `&&` (and) and `||` (or):

```
answers['primary_goal'] === 'lose_weight' || answers['primary_goal'] === 'gain_muscle'
```

### Question Bank Report

This report provides a summary of the current question bank in `src/data/questions.json`.

*   **Total Questions**: 30

#### Questions per Section

| Section        | Question Count |
| :------------- | :------------- |
| profile        | 3              |
| body           | 3              |
| goals          | 3              |
| diet_style     | 2              |
| restrictions   | 3              |
| preferences    | 5              |
| activity       | 3              |
| habits         | 8              |
| **Total**      | **30**         |

#### Branching Logic Map

This table shows which questions are conditional and what triggers their visibility.

| Question ID            | Depends On           | Condition                                                              |
| :--------------------- | :------------------- | :--------------------------------------------------------------------- |
| `target_weight`        | `primary_goal`       | `answers['primary_goal'] === 'lose' || answers['primary_goal'] === 'gain'` |
| `target_date`          | `primary_goal`       | `answers['primary_goal'] === 'lose'`                                     |
| `restrictions_other`   | `restrictions`       | `answers['restrictions'] && answers['restrictions'].includes('other')`   |
| `gluten_substitutes`   | `restrictions`       | `answers['restrictions'] && answers['restrictions'].includes('gluten')`  |
| `fav_protein`          | `diet_style`         | `answers['diet_style'] !== 'vegan'`                                    |
| `fav_plant_protein`    | `diet_style`         | `answers['diet_style'] !== 'carnivore'`                                |
| `fav_carbs`            | `diet_style`         | `answers['diet_style'] !== 'carnivore'`                                |
| `workout_type`         | `workout_frequency`  | `answers['workout_frequency'] !== '0'`                                   |

All questions have been validated and are correctly wired into the quiz engine.
