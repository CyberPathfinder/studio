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

The quiz is powered by a JSON configuration file located at `/data/questions.json`. This allows for easy updates to questions, sections, and logic without changing the application code.

### How to Add or Translate Questions

The easiest way to manage questions is by editing the CSV template located at `/data/questions_template.csv` and then running the conversion script.

1.  **Edit the CSV**: Open `/data/questions_template.csv` in a spreadsheet editor.
    *   **Add a question**: Add a new row and fill in the columns.
    *   **Translate a question**: Fill in the `label_ru`, `description_ru`, `hint_ru`, and `options_ru` columns for the desired question.
2.  **Run the Converter**: After saving your CSV changes, run the following command from your project root:
    ```bash
    node data/csv-to-json.mjs
    ```
    This will automatically update the `/data/questions.json` file.

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
