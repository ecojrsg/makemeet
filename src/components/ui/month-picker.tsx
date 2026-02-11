import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface MonthPickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MESES = [
  { valor: '01', nombre: 'Enero', corto: 'Ene' },
  { valor: '02', nombre: 'Febrero', corto: 'Feb' },
  { valor: '03', nombre: 'Marzo', corto: 'Mar' },
  { valor: '04', nombre: 'Abril', corto: 'Abr' },
  { valor: '05', nombre: 'Mayo', corto: 'May' },
  { valor: '06', nombre: 'Junio', corto: 'Jun' },
  { valor: '07', nombre: 'Julio', corto: 'Jul' },
  { valor: '08', nombre: 'Agosto', corto: 'Ago' },
  { valor: '09', nombre: 'Septiembre', corto: 'Sep' },
  { valor: '10', nombre: 'Octubre', corto: 'Oct' },
  { valor: '11', nombre: 'Noviembre', corto: 'Nov' },
  { valor: '12', nombre: 'Diciembre', corto: 'Dic' },
];

// Generar años desde 1970 hasta 2050
const YEARS = Array.from({ length: 81 }, (_, i) => (1970 + i).toString());

export function MonthPicker({ value, onChange, placeholder = 'Seleccionar mes', disabled }: MonthPickerProps) {
  const [open, setOpen] = useState(false);

  // Parsear el valor actual (formato "YYYY-MM")
  const parseValue = (val?: string) => {
    if (!val) return { year: new Date().getFullYear().toString(), month: '' };
    const [year, month] = val.split('-');
    return { year: year || new Date().getFullYear().toString(), month: month || '' };
  };

  const { year: currentYear, month: currentMonth } = parseValue(value);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Formatear para mostrar en el botón
  const formatDisplay = () => {
    if (!value) return null;
    const [year, month] = value.split('-');
    const mesObj = MESES.find((m) => m.valor === month);
    if (!mesObj) return value;
    return `${mesObj.nombre} ${year}`;
  };

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    const newValue = `${selectedYear}-${month}`;
    onChange(newValue);
    setOpen(false);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    if (selectedMonth) {
      const newValue = `${year}-${selectedMonth}`;
      onChange(newValue);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal overflow-hidden',
            !value && 'text-muted-foreground'
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate">{value ? formatDisplay() : placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          {/* Selector de Año */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Año</label>
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar año" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grid de Meses */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mes</label>
            <div className="grid grid-cols-4 gap-2">
              {MESES.map((mes) => (
                <Button
                  key={mes.valor}
                  variant={selectedMonth === mes.valor ? 'default' : 'outline'}
                  size="sm"
                  className="h-9"
                  onClick={() => handleMonthSelect(mes.valor)}
                >
                  {mes.corto}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
