import React, { useState, useEffect } from 'react';
import { Plus, Edit2, X, FileText, Eye } from 'lucide-react';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import BackButton from '../components/BackButton';
import { menuService } from '../services/database';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface WeeklyMenu {
  id: string;
  name: string;
  year: number;
  week: number;
  meal_count: number;
  meal_types: string[];
  meal_plan: MealPlanItem[][][];
}

interface MealPlanItem {
  recipeName: string;
  quantity: number;
}

const MenuPage: React.FC = () => {
  const [menus, setMenus] = useState<WeeklyMenu[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    try {
      setLoading(true);
      const data = await menuService.getAll();
      setMenus(data);
    } catch (error) {
      console.error('Error loading menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id: string) => {
    setMenuToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setMenuToDelete(null);
  };

  const handleDeleteMenu = async () => {
    if (menuToDelete) {
      try {
        await menuService.delete(menuToDelete);
        await loadMenus();
        closeDeleteModal();
      } catch (error) {
        console.error('Error deleting menu:', error);
      }
    }
  };

  const generatePDF = (menu: WeeklyMenu) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(18);
    const titleWidth = doc.getStringUnitWidth(menu.name) * doc.getFontSize() / doc.internal.scaleFactor;
    doc.text(menu.name, (pageWidth - titleWidth) / 2, 20);

    const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const tableData = menu.meal_types.map((mealType, mealIndex) => {
      return [
        mealType,
        ...weekDays.map((_day, dayIndex) => {
          const items = menu.meal_plan[dayIndex][mealIndex];
          return items.map(item => item.recipeName).join('\n—————\n');
        })
      ];
    });

    (doc as any).autoTable({
      startY: 30,
      head: [['Comida', ...weekDays]],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.1,
        lineColor: [200, 200, 200],
        cellWidth: 'auto'
      },
      headStyles: {
        fillColor: [76, 175, 80],
        textColor: 255,
        halign: 'center'
      },
      columnStyles: {
        0: {
          fillColor: [200, 220, 200],
          halign: 'left',
          cellWidth: 30
        }
      },
      margin: { left: 10, right: 10 },
      didParseCell: function(data: any) {
        if (data.section === 'body' && data.column.index > 0) {
          const text = data.cell.text.join('\n');
          data.cell.text = text.split('\n');
          data.cell.styles.cellPadding = 4;
        }
      }
    });

    doc.save(`${menu.name}.pdf`);
  };

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
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Menús semanales</h1>
      <Button icon={<Plus />} text="Añadir menú semanal" to="/add-weekly-menu" />
      <div className="mt-8">
        {menus.length > 0 ? (
          <ul className="space-y-4">
            {menus.map((menu) => (
              <li key={menu.id} className="bg-white shadow-md rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <span className="text-lg sm:text-xl font-semibold text-gray-800 break-words">{menu.name}</span>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/view-weekly-menu/${menu.id}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Link>
                    <button
                      onClick={() => generatePDF(menu)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      PDF
                    </button>
                    <Link
                      to={`/edit-weekly-menu/${menu.id}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Editar
                    </Link>
                    <button
                      onClick={() => openDeleteModal(menu.id)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-4">
            <p className="text-gray-500 italic">No hay menús semanales creados aún.</p>
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteMenu}
        message="¿Estás seguro de que quieres eliminar este menú semanal?"
      />
    </div>
  );
};

export default MenuPage;