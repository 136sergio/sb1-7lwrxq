export function getMealTypes(count: number): string[] {
    switch (count) {
      case 1: return ['Comida'];
      case 2: return ['Comida', 'Cena'];
      case 3: return ['Desayuno', 'Comida', 'Cena'];
      case 4: return ['Desayuno', 'Comida', 'Merienda', 'Cena'];
      case 5: return ['Desayuno', 'Almuerzo', 'Comida', 'Merienda', 'Cena'];
      case 6: return ['Desayuno', 'Media Mañana', 'Almuerzo', 'Comida', 'Merienda', 'Cena'];
      default: return ['Desayuno', 'Comida', 'Merienda', 'Cena'];
    }
  }