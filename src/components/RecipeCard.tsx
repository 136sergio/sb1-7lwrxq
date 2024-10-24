import React from 'react';

interface Recipe {
  id: number;
  name: string;
  ingredients: string;
  instructions: string;
}

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{recipe.name}</h2>
      <h3 className="text-lg font-medium text-gray-700 mb-1">Ingredientes:</h3>
      <p className="text-gray-600 mb-2">{recipe.ingredients}</p>
      {recipe.instructions && (
        <>
          <h3 className="text-lg font-medium text-gray-700 mb-1">Elaboración:</h3>
          <p className="text-gray-600">{recipe.instructions}</p>
        </>
      )}
    </div>
  );
};

export default RecipeCard;