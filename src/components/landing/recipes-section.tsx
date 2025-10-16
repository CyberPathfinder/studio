import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "../ui/badge";

const RecipesSection = () => {
  const recipes = [
    {
      id: "recipe-1",
      title: "Vibrant Quinoa Salad",
      tags: ["High Protein", "Vegan"],
    },
    {
      id: "recipe-2",
      title: "Grilled Lemon Herb Chicken",
      tags: ["Low Carb", "Gluten-Free"],
    },
    {
      id: "recipe-3",
      title: "Sunrise Avocado Toast",
      tags: ["Quick & Easy", "Vegetarian"],
    },
    {
      id: "recipe-4",
      title: "Berry Blast Smoothie Bowl",
      tags: ["Antioxidants", "Breakfast"],
    },
  ];

  return (
    <section id="recipes" className="bg-white py-20 md:py-28">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Healthy Doesn’t Mean Boring
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Discover thousands of delicious recipes tailored to your goals. From quick breakfasts to gourmet dinners, eating healthy has never been more exciting.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {recipes.map((recipe) => {
            const image = PlaceHolderImages.find((img) => img.id === recipe.id);
            return (
              <Card key={recipe.id} className="overflow-hidden transform-gpu transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                {image && (
                  <div className="aspect-h-3 aspect-w-4 relative">
                    <Image
                      src={image.imageUrl}
                      alt={image.description}
                      fill
                      data-ai-hint={image.imageHint}
                      className="object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="font-headline text-lg font-semibold text-foreground">{recipe.title}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {recipe.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RecipesSection;
