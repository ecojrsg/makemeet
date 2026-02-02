import { CVData, GitHubProfile, GitHubRepo } from '@/types/cv';

interface PlainTextCVPreviewProps {
  data: CVData;
  githubProfile: GitHubProfile | null;
  githubRepos: GitHubRepo[];
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  return `${month}/${year}`;
};

const skillLevelText = {
  beginner: 'Básico',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  expert: 'Experto'
};

const languageLevelText = {
  basic: 'Básico',
  conversational: 'Conversacional',
  professional: 'Profesional',
  native: 'Nativo'
};

export function PlainTextCVPreview({ data, githubProfile, githubRepos }: PlainTextCVPreviewProps) {
  const { personalInfo, experiences, education, skills, languages } = data;

  return (
    <div className="bg-card text-card-foreground p-8 font-mono text-sm leading-relaxed whitespace-pre-wrap w-full max-w-none" id="plain-cv">
      {/* Header */}
      <div className="mb-6">
        <div className="text-lg font-bold">{personalInfo.fullName || 'NOMBRE COMPLETO'}</div>
        <div>{personalInfo.title || 'Título Profesional'}</div>
        <div className="mt-2">
          {personalInfo.email && <div>Email: {personalInfo.email}</div>}
          {personalInfo.phone && <div>Teléfono: {personalInfo.phone}</div>}
          {personalInfo.location && <div>Ubicación: {personalInfo.location}</div>}
          {personalInfo.linkedin && <div>LinkedIn: {personalInfo.linkedin}</div>}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-6">
          <div className="font-bold border-b border-foreground mb-2">PERFIL PROFESIONAL</div>
          <div>{personalInfo.summary}</div>
        </div>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <div className="mb-6">
          <div className="font-bold border-b border-foreground mb-2">EXPERIENCIA LABORAL</div>
          {experiences.map((exp, index) => (
            <div key={exp.id} className={index > 0 ? 'mt-4' : ''}>
              <div className="font-semibold">{exp.position}</div>
              <div>{exp.company}</div>
              <div className="text-muted-foreground">
                {formatDate(exp.startDate)} - {exp.current ? 'Presente' : formatDate(exp.endDate)}
              </div>
              {exp.description && <div className="mt-1">{exp.description}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-6">
          <div className="font-bold border-b border-foreground mb-2">EDUCACIÓN</div>
          {education.map((edu, index) => (
            <div key={edu.id} className={index > 0 ? 'mt-3' : ''}>
              <div className="font-semibold">{edu.degree} en {edu.field}</div>
              <div>{edu.institution}</div>
              <div className="text-muted-foreground">
                {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-6">
          <div className="font-bold border-b border-foreground mb-2">HABILIDADES</div>
          <div>
            {skills.map((skill) => (
              <div key={skill.id}>• {skill.name} ({skillLevelText[skill.level]})</div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div className="mb-6">
          <div className="font-bold border-b border-foreground mb-2">IDIOMAS</div>
          <div>
            {languages.map((lang) => (
              <div key={lang.id}>• {lang.name}: {languageLevelText[lang.level]}</div>
            ))}
          </div>
        </div>
      )}

      {/* GitHub */}
      {githubProfile && (
        <div className="mb-6">
          <div className="font-bold border-b border-foreground mb-2">GITHUB</div>
          <div>Usuario: @{githubProfile.login}</div>
          <div>URL: {githubProfile.html_url}</div>
          {githubProfile.bio && <div>Bio: {githubProfile.bio}</div>}
          <div>Repositorios públicos: {githubProfile.public_repos}</div>
          <div>Seguidores: {githubProfile.followers}</div>
          
          {githubRepos.length > 0 && (
            <div className="mt-3">
              <div className="font-semibold">Repositorios destacados:</div>
              {githubRepos.map((repo) => (
                <div key={repo.id} className="mt-1">
                  • {repo.name}{repo.language ? ` (${repo.language})` : ''} - {repo.stargazers_count} ⭐
                  {repo.description && <div className="ml-2 text-muted-foreground">{repo.description}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="text-center text-muted-foreground mt-8">
        ---
        <div>CV optimizado para lectura por IA</div>
        <div>Generado con CV Generator Pro</div>
      </div>
    </div>
  );
}
