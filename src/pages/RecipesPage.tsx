import React, { useState, useEffect } from 'react';
import { Plus, Edit2, X, Download, Upload } from 'lucide-react';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import BackButton from '../components/BackButton';
import { recipeService } from '../services/database';
import * as XLSX from 'xlsx';

interface Recipe {
  id: string;
  name: string;
  meal_types: string[];
  week_days: string[];
}

interface ImportSummary {
  toAdd: { name: string; meal_types: string[]; week_days: string[]; }[];
  duplicates: string[];
}

const RecipesPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [selectedWeekDays, setSelectedWeekDays] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [pendingImport, setPendingImport] = useState<ImportSummary | null>(null);

  const mealTypeOptions = ['Desayuno', 'Media Mañana', 'Almuerzo', 'Comida', 'Merienda', 'Cena'];
  const weekDayOptions = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getAll();
      const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
      setRecipes(sortedData);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Nombre de la Receta': '',
        'Desayuno (X)': '',
        'Media Mañana (X)': '',
        'Almuerzo (X)': '',
        'Comida (X)': '',
        'Merienda (X)': '',
        'Cena (X)': '',
        'Lunes (X)': '',
        'Martes (X)': '',
        'Miércoles (X)': '',
        'Jueves (X)': '',
        'Viernes (X)': '',
        'Sábado (X)': '',
        'Domingo (X)': ''
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
    XLSX.writeFile(wb, 'plantilla_recetas.xlsx');
  };

  const processImportedRecipes = (jsonData: any[]): ImportSummary => {
    const existingNames = new Set(recipes.map(r => r.name.toLowerCase()));
    const toAdd: { name: string; meal_types: string[]; week_days: string[]; }[] = [];
    const duplicates: string[] = [];

    jsonData.forEach(row => {
      if (!row['Nombre de la Receta']) return;

      const mealTypes = mealTypeOptions.filter(type => 
        row[`${type} (X)`]?.toString().toLowerCase() === 'x'
      );
      const weekDays = weekDayOptions.filter(day => 
        row[`${day} (X)`]?.toString().toLowerCase() === 'x'
      );

      const recipe = {
        name: row['Nombre de la Receta'],
        meal_types: mealTypes,
        week_days: weekDays
      };

      if (existingNames.has(recipe.name.toLowerCase())) {
        duplicates.push(recipe.name);
      } else {
        toAdd.push(recipe);
      }
    });

    return { toAdd, duplicates };
  };

  const importRecipes = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (!validateTemplate(jsonData[0] as any)) {
        setError('Plantilla incorrecta');
        return;
      }

      const summary = processImportedRecipes(jsonData);
      setPendingImport(summary);

    } catch (error) {
      console.error('Error importing recipes:', error);
      setError('Error al importar las recetas');
    }

    // Clear the input file
    event.target.value = '';
  };

  const confirmImport = async () => {
    if (!pendingImport) return;

    try {
      setError(null);
      for (const recipe of pendingImport.toAdd) {
        await recipeService.create({
          name: recipe.name,
          meal_types: recipe.meal_types,
          week_days: recipe.week_days,
          instructions: ''
        }, []); // Sin ingredientes inicialmente
      }
      await loadRecipes();
      setPendingImport(null);
    } catch (err) {
      console.error('Error importing recipes:', err);
      setError(err instanceof Error ? err.message : 'Error al importar las recetas');
    }
  };

  const validateTemplate = (firstRow: any) => {
    const requiredColumns = [
      'Nombre de la Receta',
      ...mealTypeOptions.map(type => `${type} (X)`),
      ...weekDayOptions.map(day => `${day} (X)`)
    ];

    return requiredColumns.every(column => column in firstRow);
  };

  const openDeleteModal = (id: string) => {
    setRecipeToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setRecipeToDelete(null);
  };

  const handleDeleteRecipe = async () => {
    if (recipeToDelete) {
      try {
        await recipeService.delete(recipeToDelete);
        await loadRecipes();
        closeDeleteModal();
      } catch (error) {
        console.error('Error deleting recipe:', error);
      }
    }
  };

  const toggleMealType = (mealType: string) => {
    setSelectedMealTypes(prev => 
      prev.includes(mealType)
        ? prev.filter(type => type !== mealType)
        : [...prev, mealType]
    );
  };

  const toggleWeekDay = (weekDay: string) => {
    setSelectedWeekDays(prev => 
      prev.includes(weekDay)
        ? prev.filter(day => day !== weekDay)
        : [...prev, weekDay]
    );
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesMealType = selectedMealTypes.length === 0 || 
      selectedMealTypes.some(type => recipe.meal_types.includes(type));
    const matchesWeekDay = selectedWeekDays.length === 0 || 
      selectedWeekDays.some(day => recipe.week_days.includes(day));
    return matchesMealType && matchesWeekDay;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Recetas</h1>
        <div className="flex space-x-2">
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-5 w-5 mr-2" />
            Descargar Plantilla
          </button>
          <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 cursor-pointer">
            <Upload className="h-5 w-5 mr-2" />
            Importar Recetas
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={importRecipes}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <Button icon={<Plus />} text="Añadir Receta" to="/add-recipe" />

      <div className="mt-6 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Filtrar por preferencia de comida:</h3>
          <div className="flex flex-wrap gap-2">
            {mealTypeOptions.map((mealType) => (
              <button
                key={mealType}
                onClick={() => toggleMealType(mealType)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedMealTypes.includes(mealType)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {mealType}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Filtrar por preferencia de día:</h3>
          <div className="flex flex-wrap gap-2">
            {weekDayOptions.map((weekDay) => (
              <button
                key={weekDay}
                onClick={() => toggleWeekDay(weekDay)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedWeekDays.includes(weekDay)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {weekDay}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        {filteredRecipes.length > 0 ? (
          <ul className="space-y-4">
            {filteredRecipes.map((recipe) => (
              <li key={recipe.id} className="flex items-center justify-between bg-white shadow-md rounded-lg p-4">
                <div className="flex flex-col">
                  <span className="text-xl font-semibold text-gray-800">{recipe.name}</span>
                  {(recipe.meal_types.length > 0 || recipe.week_days.length > 0) && (
                    <div className="mt-1 space-y-1">
                      {recipe.meal_types.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {recipe.meal_types.map((type) => (
                            <span key={type} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              {type}
                            </span>
                          ))}
                        </div>
                      )}
                      {recipe.week_days.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {recipe.week_days.map((day) => (
                            <span key={day} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              {day}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/edit-recipe/${recipe.id}`}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </Link>
                  <button
                    onClick={() => openDeleteModal(recipe.id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-4">
            <p className="text-gray-500 italic">No hay recetas que coincidan con los filtros seleccionados.</p>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteRecipe}
        message="¿Estás seguro de que quieres eliminar esta receta?"
      />

      <ConfirmationModal
        isOpen={!!pendingImport}
        onClose={() => setPendingImport(null)}
        onConfirm={confirmImport}
        message={
          pendingImport ? 
          `Se añadirán ${pendingImport.toAdd.length} recetas.\nNo se añadirán ${pendingImport.duplicates.length} recetas por estar duplicadas o erróneas.\n¿Está usted seguro?` :
          ''
        }
      />
    </div>
  );
};

export default RecipesPage;