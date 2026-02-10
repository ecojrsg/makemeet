import { useState } from 'react';
import { CVData } from '@/types/cv';
import { TipoPlantilla } from '@/types/templates';
import { CVForm } from '@/components/CVForm';
import { PlainTextCVPreview } from '@/components/PlainTextCVPreview';
import { PlantillaModerna, PlantillaClasica, PlantillaMinimalista, PlantillaCreativa } from '@/components/templates';
import { useGitHub } from '@/hooks/useGitHub';
import { useAuth } from '@/contexts/AuthContext';
import { useCVs, CVGuardado } from '@/hooks/useCVs';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { SaveCVDialog } from '@/components/cv/SaveCVDialog';
import { SidebarPanel } from '@/components/cv/SidebarPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Sparkles, Code, Github, Loader2, LogIn, LogOut, User, Save } from 'lucide-react';
import { toast } from 'sonner';
const initialCVData: CVData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    summary: '',
    linkedin: '',
    website: ''
  },
  experiences: [],
  education: [],
  skills: [],
  languages: [],
  githubUsername: ''
};
const Index = () => {
  const [cvData, setCvData] = useState<CVData>(initialCVData);
  const [activePreview, setActivePreview] = useState<'styled' | 'plain'>('styled');
  const [authDialogAbierto, setAuthDialogAbierto] = useState(false);
  const [saveDialogAbierto, setSaveDialogAbierto] = useState(false);
  const [cvActualId, setCvActualId] = useState<string | null>(null);
  const [cvActualNombre, setCvActualNombre] = useState('');
  const [cvActualEtiquetas, setCvActualEtiquetas] = useState<string[]>([]);
  const [plantillaActual, setPlantillaActual] = useState<TipoPlantilla>('moderno');
  const {
    profile: githubProfile,
    repos: githubRepos,
    loading: githubLoading,
    error: githubError
  } = useGitHub(cvData.githubUsername);
  const {
    usuario,
    perfil,
    cargando: authCargando,
    cerrarSesion
  } = useAuth();
  const {
    cvs,
    cargando: cvsCargando,
    guardarCV,
    actualizarCV,
    eliminarCV
  } = useCVs();
  const handleExport = async (format: 'styled' | 'plain') => {
    const elementId = format === 'styled' ? 'styled-cv' : 'plain-cv';
    const element = document.getElementById(elementId);
    if (!element) {
      toast.error('Error al exportar el CV');
      return;
    }
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas-pro'),
        import('jspdf')
      ]);

      // Clonar elemento fuera del contexto sticky para evitar
      // desalineación vertical en html2canvas
      const clone = element.cloneNode(true) as HTMLElement;
      clone.removeAttribute('id');

      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = `${element.scrollWidth}px`;
      container.style.zIndex = '-1000';
      container.style.overflow = 'visible';
      container.appendChild(clone);
      document.body.appendChild(container);

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
      });

      document.body.removeChild(container);

      const imgData = canvas.toDataURL('image/jpeg', 1);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      let heightLeft: number;
      let position: number;

      if (format === 'plain') {
        const margin = 10;
        const contentWidth = pageWidth - margin * 2;
        const contentImgHeight = (canvas.height * contentWidth) / canvas.width;
        heightLeft = contentImgHeight;
        position = margin;

        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentImgHeight);
        heightLeft -= (pageHeight - margin);

        while (heightLeft > 0) {
          pdf.addPage();
          position = margin - (contentImgHeight - heightLeft);
          pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentImgHeight);
          heightLeft -= pageHeight;
        }
      } else {
        const imgHeight = (canvas.height * pageWidth) / canvas.width;
        heightLeft = imgHeight;
        position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position -= pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }

      pdf.save(`cv-${format === 'styled' ? 'profesional' : 'texto-plano'}.pdf`);
      toast.success('CV exportado correctamente');
    } catch (error) {
      const leftover = document.querySelector('div[style*="left: -9999px"]');
      if (leftover?.parentNode === document.body) {
        document.body.removeChild(leftover);
      }
      toast.error('Error al exportar. Intenta de nuevo.');
    }
  };
  const copyPlainText = () => {
    const element = document.getElementById('plain-cv');
    if (element) {
      const text = element.innerText;
      navigator.clipboard.writeText(text);
      toast.success('Texto copiado al portapapeles');
    }
  };
  const manejarNuevoCV = () => {
    setCvData(initialCVData);
    setCvActualId(null);
    setCvActualNombre('');
    setCvActualEtiquetas([]);
    toast.info('Nuevo CV creado');
  };
  const manejarSeleccionarCV = (cv: CVGuardado) => {
    setCvData(cv.datos_cv);
    setCvActualId(cv.id);
    setCvActualNombre(cv.nombre);
    setCvActualEtiquetas(cv.etiquetas);
    toast.success(`CV "${cv.nombre}" cargado`);
  };
  const manejarGuardarCV = async (nombre: string, etiquetas: string[]) => {
    if (cvActualId) {
      // Actualizar existente
      await actualizarCV(cvActualId, nombre, etiquetas, cvData);
      setCvActualNombre(nombre);
      setCvActualEtiquetas(etiquetas);
    } else {
      // Crear nuevo
      const resultado = await guardarCV(nombre, etiquetas, cvData);
      if (resultado) {
        setCvActualId(resultado.id);
        setCvActualNombre(nombre);
        setCvActualEtiquetas(etiquetas);
      }
    }
  };
  const manejarEliminarCV = async (id: string) => {
    const confirmado = window.confirm('¿Estás seguro de eliminar este CV?');
    if (confirmado) {
      await eliminarCV(id);
      if (cvActualId === id) {
        manejarNuevoCV();
      }
    }
  };
  return <div className="min-h-screen bg-background">
    {/* Header */}
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">MakeMeEt</h1>
              <p className="text-sm text-muted-foreground">Crea tu currículum en segundos</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {cvData.githubUsername && <div className="hidden md:flex items-center gap-2 text-sm">
              {githubLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : githubProfile ? <div className="flex items-center gap-2 text-primary">
                <Github className="h-4 w-4" />
                <span>@{githubProfile.login}</span>
              </div> : githubError ? <span className="text-destructive text-xs">{githubError}</span> : null}
            </div>}

            {authCargando ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : usuario ? <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{perfil?.nombre || usuario.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={cerrarSesion}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div> : <Button size="sm" onClick={() => setAuthDialogAbierto(true)}>
              <LogIn className="h-4 w-4 mr-2" />
              Iniciar sesión
            </Button>}
          </div>
        </div>
      </div>
    </header>

    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Sidebar izquierdo - CVs guardados + Selector de plantillas */}
        <div className="xl:col-span-3 order-1 xl:order-none">
          <SidebarPanel usuario={!!usuario} cvs={cvs} cvsCargando={cvsCargando} cvActualId={cvActualId ?? undefined} plantillaActual={plantillaActual} onNuevoCV={manejarNuevoCV} onSeleccionarCV={manejarSeleccionarCV} onEliminarCV={manejarEliminarCV} onCambiarPlantilla={setPlantillaActual} />
        </div>

        {/* Form Section */}
        <div className="space-y-4 xl:col-span-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">
                {cvActualId ? cvActualNombre : 'Nuevo CV'}
              </h2>
            </div>
            {usuario && <Button variant="outline" size="sm" onClick={() => setSaveDialogAbierto(true)}>
              <Save className="h-4 w-4 mr-2" />
              {cvActualId ? 'Actualizar' : 'Guardar'}
            </Button>}
          </div>
          <CVForm data={cvData} onChange={setCvData} />
        </div>

        {/* Preview Section */}
        <div className="space-y-4 xl:col-span-4">
          <div className="sticky top-24">
            <Tabs value={activePreview} onValueChange={v => setActivePreview(v as 'styled' | 'plain')}>
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="styled" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">Profesional</span>
                  </TabsTrigger>
                  <TabsTrigger value="plain" className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    <span className="hidden sm:inline">Texto IA</span>
                  </TabsTrigger>
                </TabsList>

                <div className="flex gap-2">
                  {activePreview === 'plain' && <Button variant="outline" size="sm" onClick={copyPlainText}>
                    Copiar
                  </Button>}
                  <Button size="sm" onClick={() => handleExport(activePreview)} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Exportar</span>
                  </Button>
                </div>
              </div>

              <TabsContent value="styled" className="m-0">
                {plantillaActual === 'moderno' && <PlantillaModerna datos={cvData} perfilGithub={githubProfile} reposGithub={githubRepos} />}
                {plantillaActual === 'clasico' && <PlantillaClasica datos={cvData} perfilGithub={githubProfile} reposGithub={githubRepos} />}
                {plantillaActual === 'minimalista' && <PlantillaMinimalista datos={cvData} perfilGithub={githubProfile} reposGithub={githubRepos} />}
                {plantillaActual === 'creativo' && <PlantillaCreativa datos={cvData} perfilGithub={githubProfile} reposGithub={githubRepos} />}
              </TabsContent>
              <TabsContent value="plain" className="m-0">
                <div className="overflow-auto scrollbar-hidden bg-muted/30 border border-border rounded-lg" style={{
                  maxHeight: 'calc(100vh - 200px)'
                }}>
                  <PlainTextCVPreview data={cvData} githubProfile={githubProfile} githubRepos={githubRepos} />
                </div>
              </TabsContent>
            </Tabs>

            {activePreview === 'plain' && <p className="text-xs text-muted-foreground mt-3 text-center">
              Optimizado para sistemas ATS y modelos de IA
            </p>}
          </div>
        </div>
      </div>
    </main>

    {/* Dialogs */}
    <AuthDialog abierto={authDialogAbierto} onCerrar={() => setAuthDialogAbierto(false)} />

    <SaveCVDialog abierto={saveDialogAbierto} onCerrar={() => setSaveDialogAbierto(false)} onGuardar={manejarGuardarCV} nombreInicial={cvActualNombre} etiquetasIniciales={cvActualEtiquetas} modoEdicion={!!cvActualId} />
  </div>;
};
export default Index;