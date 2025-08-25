import { useParams } from 'react-router-dom';

export default function RecipeDetail() {
  const { name } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Recipe: {name}</h1>
        <p className="text-gray-600 mt-2">Recipe detail page - coming soon</p>
      </div>
    </div>
  );
}
