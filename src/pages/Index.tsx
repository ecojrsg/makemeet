import { useState } from 'react';
import ReactDOM from 'react-dom/client';
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
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Sparkles, Code, Save } from 'lucide-react';
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
    let element = document.getElementById(elementId);
    if (!element) {
      toast.error('Error al exportar el CV');
      return;
    }
    
    let tempContainer: HTMLDivElement | null = null;
    let tempRoot: any = null;
    
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas-pro'),
        import('jspdf')
      ]);

      // Si es formato styled, crear una versión temporal con mode="export"
      if (format === 'styled') {
        tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '210mm';
        tempContainer.style.zIndex = '-1000';
        document.body.appendChild(tempContainer);

        // Renderizar la plantilla con mode="export"
        let plantillaComponent;
        if (plantillaActual === 'moderno') {
          plantillaComponent = <PlantillaModerna datos={cvData} perfilGithub={githubProfile} reposGithub={githubRepos} mode="export" />;
        } else if (plantillaActual === 'clasico') {
          plantillaComponent = <PlantillaClasica datos={cvData} perfilGithub={githubProfile} reposGithub={githubRepos} mode="export" />;
        } else if (plantillaActual === 'minimalista') {
          plantillaComponent = <PlantillaMinimalista datos={cvData} perfilGithub={githubProfile} reposGithub={githubRepos} mode="export" />;
        } else {
          plantillaComponent = <PlantillaCreativa datos={cvData} perfilGithub={githubProfile} reposGithub={githubRepos} mode="export" />;
        }

        tempRoot = ReactDOM.createRoot(tempContainer);
        await new Promise<void>((resolve) => {
          tempRoot.render(plantillaComponent);
          // Esperar a que el renderizado se complete
          setTimeout(resolve, 100);
        });

        element = tempContainer.querySelector('[id="styled-cv"]') as HTMLElement || tempContainer.firstChild as HTMLElement;
      }

      // Clonar elemento fuera del contexto sticky para evitar
      // desalineación vertical en html2canvas
      const clone = element.cloneNode(true) as HTMLElement;
      clone.removeAttribute('id');

      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = format === 'styled' ? '210mm' : `${element.scrollWidth}px`;
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
        windowWidth: format === 'styled' ? 794 : element.scrollWidth, // 210mm = ~794px
      });

      document.body.removeChild(container);
      if (tempContainer && tempRoot) {
        tempRoot.unmount();
        document.body.removeChild(tempContainer);
      }

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
      if (tempContainer && tempRoot) {
        try {
          tempRoot.unmount();
          if (document.body.contains(tempContainer)) {
            document.body.removeChild(tempContainer);
          }
        } catch {}
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

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar
        usuario={!!usuario}
        cvs={cvs}
        cvsCargando={cvsCargando}
        cvActualId={cvActualId ?? undefined}
        plantillaActual={plantillaActual}
        onNuevoCV={manejarNuevoCV}
        onSeleccionarCV={manejarSeleccionarCV}
        onEliminarCV={manejarEliminarCV}
        onCambiarPlantilla={setPlantillaActual}
      />

      <SidebarInset>
        <PageHeader
          usuario={usuario}
          perfil={perfil}
          githubProfile={githubProfile}
          githubLoading={githubLoading}
          onLogout={cerrarSesion}
          onOpenAuth={() => setAuthDialogAbierto(true)}
        />

        <main className="container mx-auto px-4 py-8">
          {/* MOBILE: Tabs para Formulario/Preview */}
          <div className="lg:hidden">
            <Tabs defaultValue="form" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="form">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Formulario
                </TabsTrigger>
                <TabsTrigger value="preview">
                  <Code className="h-4 w-4 mr-2" />
                  Vista Previa
                </TabsTrigger>
              </TabsList>

              <TabsContent value="form" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    {cvActualId ? cvActualNombre : 'Nuevo CV'}
                  </h2>
                  {usuario && (
                    <Button variant="outline" size="sm" onClick={() => setSaveDialogAbierto(true)}>
                      <Save className="h-4 w-4 mr-2" />
                      {cvActualId ? 'Actualizar' : 'Guardar'}
                    </Button>
                  )}
                </div>
                <CVForm data={cvData} onChange={setCvData} />
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <Tabs value={activePreview} onValueChange={(v) => setActivePreview(v as 'styled' | 'plain')}>
                  <div className="flex items-center justify-between mb-4">
                    <TabsList>
                      <TabsTrigger value="styled" className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        Profesional
                      </TabsTrigger>
                      <TabsTrigger value="plain" className="gap-2">
                        <Code className="h-4 w-4" />
                        Texto IA
                      </TabsTrigger>
                    </TabsList>
                    <div className="flex gap-2">
                      {activePreview === 'plain' && (
                        <Button variant="outline" size="sm" onClick={copyPlainText}>
                          Copiar
                        </Button>
                      )}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleExport(activePreview)}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Exportar
                      </Button>
                    </div>
                  </div>

                  <TabsContent value="styled" className="mt-0">
                    <div id="styled-cv" className="bg-white shadow-lg min-h-[calc(100vh-250px)] flex flex-col">
                      {plantillaActual === 'moderno' && (
                        <PlantillaModerna
                          datos={cvData}
                          perfilGithub={githubProfile}
                          reposGithub={githubRepos}
                          mode="preview"
                        />
                      )}
                      {plantillaActual === 'clasico' && (
                        <PlantillaClasica
                          datos={cvData}
                          perfilGithub={githubProfile}
                          reposGithub={githubRepos}
                          mode="preview"
                        />
                      )}
                      {plantillaActual === 'minimalista' && (
                        <PlantillaMinimalista
                          datos={cvData}
                          perfilGithub={githubProfile}
                          reposGithub={githubRepos}
                          mode="preview"
                        />
                      )}
                      {plantillaActual === 'creativo' && (
                        <PlantillaCreativa
                          datos={cvData}
                          perfilGithub={githubProfile}
                          reposGithub={githubRepos}
                          mode="preview"
                        />
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="plain" className="mt-0">
                    <div id="plain-cv" className="overflow-auto scrollbar-hidden bg-muted/30 border border-border rounded-lg" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                      <PlainTextCVPreview
                        data={cvData}
                        githubProfile={githubProfile}
                        githubRepos={githubRepos}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {activePreview === 'plain' && (
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Optimizado para sistemas ATS y modelos de IA
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* DESKTOP: Grid lado a lado */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-6">
            {/* Formulario - 4 columnas (33.33%) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">
                    {cvActualId ? cvActualNombre : 'Nuevo CV'}
                  </h2>
                </div>
                {usuario && (
                  <Button variant="outline" size="sm" onClick={() => setSaveDialogAbierto(true)}>
                    <Save className="h-4 w-4 mr-2" />
                    {cvActualId ? 'Actualizar' : 'Guardar'}
                  </Button>
                )}
              </div>
              <CVForm data={cvData} onChange={setCvData} />
            </div>

            {/* Preview - 8 columnas (66.67%) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="sticky top-24 min-h-[calc(100vh-8rem)]">
                <Tabs value={activePreview} onValueChange={(v) => setActivePreview(v as 'styled' | 'plain')}>
                  <div className="flex items-center justify-between mb-4">
                    <TabsList>
                      <TabsTrigger value="styled" className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        Profesional
                      </TabsTrigger>
                      <TabsTrigger value="plain" className="gap-2">
                        <Code className="h-4 w-4" />
                        Texto IA
                      </TabsTrigger>
                    </TabsList>
                    <div className="flex gap-2">
                      {activePreview === 'plain' && (
                        <Button variant="outline" size="sm" onClick={copyPlainText}>
                          Copiar
                        </Button>
                      )}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleExport(activePreview)}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Exportar PDF
                      </Button>
                    </div>
                  </div>

                  <TabsContent value="styled" className="mt-0">
                    <div id="styled-cv" className="bg-white shadow-lg min-h-[calc(100vh-14rem)] flex flex-col">
                      {plantillaActual === 'moderno' && (
                        <PlantillaModerna
                          datos={cvData}
                          perfilGithub={githubProfile}
                          reposGithub={githubRepos}
                          mode="preview"
                        />
                      )}
                      {plantillaActual === 'clasico' && (
                        <PlantillaClasica
                          datos={cvData}
                          perfilGithub={githubProfile}
                          reposGithub={githubRepos}
                          mode="preview"
                        />
                      )}
                      {plantillaActual === 'minimalista' && (
                        <PlantillaMinimalista
                          datos={cvData}
                          perfilGithub={githubProfile}
                          reposGithub={githubRepos}
                          mode="preview"
                        />
                      )}
                      {plantillaActual === 'creativo' && (
                        <PlantillaCreativa
                          datos={cvData}
                          perfilGithub={githubProfile}
                          reposGithub={githubRepos}
                          mode="preview"
                        />
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="plain" className="mt-0">
                    <div id="plain-cv" className="overflow-auto scrollbar-hidden bg-muted/30 border border-border rounded-lg" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                      <PlainTextCVPreview
                        data={cvData}
                        githubProfile={githubProfile}
                        githubRepos={githubRepos}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {activePreview === 'plain' && (
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Optimizado para sistemas ATS y modelos de IA
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Dialogs */}
        <AuthDialog
          abierto={authDialogAbierto}
          onCerrar={() => setAuthDialogAbierto(false)}
        />
        <SaveCVDialog
          abierto={saveDialogAbierto}
          onCerrar={() => setSaveDialogAbierto(false)}
          onGuardar={manejarGuardarCV}
          nombreInicial={cvActualNombre}
          etiquetasIniciales={cvActualEtiquetas}
          modoEdicion={!!cvActualId}
        />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Index;
