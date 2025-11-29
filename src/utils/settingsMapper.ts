// Utility to map between camelCase (form) and snake_case (database)

export const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

// Map form data (camelCase) to database format (snake_case)
export const mapFormToDb = (formData: Record<string, any>): Record<string, any> => {
  const dbData: Record<string, any> = {};

  for (const [key, value] of Object.entries(formData)) {
    dbData[camelToSnake(key)] = value;
  }

  return dbData;
};

// Map database data (snake_case) to form format (camelCase)
export const mapDbToForm = (dbData: Record<string, any>): Record<string, any> => {
  const formData: Record<string, any> = {};

  for (const [key, value] of Object.entries(dbData)) {
    if (key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'key' && key !== 'value') {
      formData[snakeToCamel(key)] = value;
    }
  }

  return formData;
};
