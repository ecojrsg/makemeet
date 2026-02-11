import { useRef, useState } from 'react';
import { CVData, Experience, Education, Skill, Language } from '@/types/cv';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, User, Briefcase, GraduationCap, Code, Languages, Github, Camera, X, Sparkles, Loader2 } from 'lucide-react';
import { mejorarTextoConIA } from '@/services/aiService';
import { toast } from '@/hooks/use-toast';

interface CVFormProps {
  data: CVData;
  onChange: (data: CVData) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export function CVForm({ data, onChange }: CVFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mejorando, setMejorando] = useState<string | null>(null);

  const handleMejorarConIA = async (
    campoId: string,
    texto: string,
    contexto: 'resumen' | 'experiencia' | 'educacion',
    onMejorado: (texto: string) => void,
    infoAdicional?: string
  ) => {
    if (!texto.trim()) return;
    setMejorando(campoId);
    try {
      const mejorado = await mejorarTextoConIA(texto, contexto, infoAdicional);
      onMejorado(mejorado);
      toast({ title: 'Texto mejorado con IA' });
    } catch (e) {
      toast({
        title: 'Error al mejorar con IA',
        description: e instanceof Error ? e.message : 'Error desconocido',
        variant: 'destructive',
      });
    } finally {
      setMejorando(null);
    }
  };

  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value }
    });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePersonalInfo('photo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    updatePersonalInfo('photo', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: generateId(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    onChange({ ...data, experiences: [...data.experiences, newExp] });
  };

  const updateExperience = (id: string, field: string, value: string | boolean) => {
    onChange({
      ...data,
      experiences: data.experiences.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...data,
      experiences: data.experiences.filter(exp => exp.id !== id)
    });
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: generateId(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const updateEducation = (id: string, field: string, value: string) => {
    onChange({
      ...data,
      education: data.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...data,
      education: data.education.filter(edu => edu.id !== id)
    });
  };

  const addSkill = () => {
    const newSkill: Skill = { id: generateId(), name: '', level: 'intermediate' };
    onChange({ ...data, skills: [...data.skills, newSkill] });
  };

  const updateSkill = (id: string, field: string, value: string) => {
    onChange({
      ...data,
      skills: data.skills.map(skill =>
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    });
  };

  const removeSkill = (id: string) => {
    onChange({ ...data, skills: data.skills.filter(skill => skill.id !== id) });
  };

  const addLanguage = () => {
    const newLang: Language = { id: generateId(), name: '', level: 'conversational' };
    onChange({ ...data, languages: [...data.languages, newLang] });
  };

  const updateLanguage = (id: string, field: string, value: string) => {
    onChange({
      ...data,
      languages: data.languages.map(lang =>
        lang.id === id ? { ...lang, [field]: value } : lang
      )
    });
  };

  const removeLanguage = (id: string) => {
    onChange({ ...data, languages: data.languages.filter(lang => lang.id !== id) });
  };

  return (
    <div className="space-y-6">
      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Photo Upload */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {data.personalInfo.photo ? (
                <div className="relative">
                  <img
                    src={data.personalInfo.photo}
                    alt="Foto de perfil"
                    className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
                    onClick={removePhoto}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div
                  className="w-24 h-24 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors border-2 border-dashed border-border"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <Label className="text-sm font-medium">Foto de perfil</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Esta foto solo aparecerá en el CV profesional con diseño.
              </p>
              {!data.personalInfo.photo && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Subir foto
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                value={data.personalInfo.fullName}
                onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                placeholder="Juan García López"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Título profesional</Label>
              <Input
                id="title"
                value={data.personalInfo.title}
                onChange={(e) => updatePersonalInfo('title', e.target.value)}
                placeholder="Desarrollador Full Stack"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={data.personalInfo.email}
                onChange={(e) => updatePersonalInfo('email', e.target.value)}
                placeholder="juan@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={data.personalInfo.phone}
                onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                placeholder="+34 600 000 000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={data.personalInfo.location}
                onChange={(e) => updatePersonalInfo('location', e.target.value)}
                placeholder="México, CDMX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn (opcional)</Label>
              <Input
                id="linkedin"
                value={data.personalInfo.linkedin || ''}
                onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                placeholder="linkedin.com/in/usuario"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="summary">Resumen profesional</Label>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs h-7"
                disabled={!data.personalInfo.summary.trim() || mejorando !== null}
                onClick={() =>
                  handleMejorarConIA(
                    'summary',
                    data.personalInfo.summary,
                    'resumen',
                    (t) => updatePersonalInfo('summary', t)
                  )
                }
              >
                {mejorando === 'summary' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                Mejorar con IA
              </Button>
            </div>
            <Textarea
              id="summary"
              value={data.personalInfo.summary}
              onChange={(e) => updatePersonalInfo('summary', e.target.value)}
              placeholder="Breve descripción de tu perfil profesional..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* GitHub */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5 text-primary" />
            Perfil de GitHub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="github">Usuario de GitHub</Label>
            <Input
              id="github"
              value={data.githubUsername || ''}
              onChange={(e) => onChange({ ...data, githubUsername: e.target.value })}
              placeholder="tu-usuario-github"
            />
            <p className="text-sm text-muted-foreground">
              Se mostrará tu perfil y repositorios destacados en el CV
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Experiencia Laboral
            </span>
            <Button onClick={addExperience} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" /> Añadir
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.experiences.map((exp, index) => (
            <div key={exp.id} className="p-4 border border-border rounded-lg space-y-4 relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-destructive hover:text-destructive"
                onClick={() => removeExperience(exp.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    placeholder="Nombre de la empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Puesto</Label>
                  <Input
                    value={exp.position}
                    onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                    placeholder="Tu cargo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha inicio</Label>
                  <Input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Fecha fin</Label>
                    <div className="flex items-center gap-1.5">
                      <Switch
                        id={`current-${exp.id}`}
                        checked={exp.current}
                        onCheckedChange={(checked) => updateExperience(exp.id, 'current', checked)}
                      />
                      <Label htmlFor={`current-${exp.id}`} className="text-xs">Actual</Label>
                    </div>
                  </div>
                  <Input
                    type="month"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                    disabled={exp.current}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Descripción</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-xs h-7"
                    disabled={!exp.description.trim() || mejorando !== null}
                    onClick={() =>
                      handleMejorarConIA(
                        `exp-${exp.id}`,
                        exp.description,
                        'experiencia',
                        (t) => updateExperience(exp.id, 'description', t),
                        `${exp.position} en ${exp.company}`
                      )
                    }
                  >
                    {mejorando === `exp-${exp.id}` ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    Mejorar con IA
                  </Button>
                </div>
                <Textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                  placeholder="Describe tus responsabilidades y logros..."
                  rows={3}
                />
              </div>
            </div>
          ))}
          {data.experiences.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No hay experiencia añadida. Haz clic en "Añadir" para agregar una.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Educación
            </span>
            <Button onClick={addEducation} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" /> Añadir
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.education.map((edu) => (
            <div key={edu.id} className="p-4 border border-border rounded-lg space-y-4 relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-destructive hover:text-destructive"
                onClick={() => removeEducation(edu.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Institución</Label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                    placeholder="Universidad o centro"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                    placeholder="Grado, Máster, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Campo de estudio</Label>
                  <Input
                    value={edu.field}
                    onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                    placeholder="Ingeniería Informática"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha inicio</Label>
                  <Input
                    type="month"
                    value={edu.startDate}
                    onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha fin</Label>
                  <Input
                    type="month"
                    value={edu.endDate}
                    onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Descripción</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-xs h-7"
                    disabled={!(edu.description || '').trim() || mejorando !== null}
                    onClick={() =>
                      handleMejorarConIA(
                        `edu-${edu.id}`,
                        edu.description || '',
                        'educacion',
                        (t) => updateEducation(edu.id, 'description', t),
                        `${edu.degree} en ${edu.field}`
                      )
                    }
                  >
                    {mejorando === `edu-${edu.id}` ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    Mejorar con IA
                  </Button>
                </div>
                <Textarea
                  value={edu.description || ''}
                  onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                  placeholder="Describe tu formación, logros académicos..."
                  rows={3}
                />
              </div>
            </div>
          ))}
          {data.education.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No hay educación añadida. Haz clic en "Añadir" para agregar una.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Habilidades
            </span>
            <Button onClick={addSkill} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" /> Añadir
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.skills.map((skill) => (
              <div key={skill.id} className="flex items-center gap-3">
                <Input
                  value={skill.name}
                  onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                  placeholder="Nombre de la habilidad"
                  className="flex-[2]"
                />
                <Select
                  value={skill.level}
                  onValueChange={(value) => updateSkill(skill.id, 'level', value)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Básico</SelectItem>
                    <SelectItem value="intermediate">Intermedio</SelectItem>
                    <SelectItem value="advanced">Avanzado</SelectItem>
                    <SelectItem value="expert">Experto</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => removeSkill(skill.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          {data.skills.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No hay habilidades añadidas.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" />
              Idiomas
            </span>
            <Button onClick={addLanguage} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" /> Añadir
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.languages.map((lang) => (
              <div key={lang.id} className="flex items-center gap-3">
                <Input
                  value={lang.name}
                  onChange={(e) => updateLanguage(lang.id, 'name', e.target.value)}
                  placeholder="Idioma"
                  className="flex-[2]"
                />
                <Select
                  value={lang.level}
                  onValueChange={(value) => updateLanguage(lang.id, 'level', value)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="conversational">Conversacional</SelectItem>
                    <SelectItem value="professional">Profesional</SelectItem>
                    <SelectItem value="native">Nativo</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => removeLanguage(lang.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          {data.languages.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No hay idiomas añadidos.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
