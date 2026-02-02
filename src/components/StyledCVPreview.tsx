import { CVData, GitHubProfile, GitHubRepo } from '@/types/cv';
import { Mail, Phone, MapPin, Linkedin, Globe, Github, Star, GitFork, Users, BookOpen } from 'lucide-react';

interface StyledCVPreviewProps {
  data: CVData;
  githubProfile: GitHubProfile | null;
  githubRepos: GitHubRepo[];
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${months[parseInt(month) - 1]} ${year}`;
};


const languageLevelText = {
  basic: 'Básico',
  conversational: 'Conversacional',
  professional: 'Profesional',
  native: 'Nativo'
};

export function StyledCVPreview({ data, githubProfile, githubRepos }: StyledCVPreviewProps) {
  const { personalInfo, experiences, education, skills, languages } = data;

  return (
    <div 
      id="styled-cv"
      style={{ 
        width: '210mm', 
        minHeight: '297mm', 
        fontSize: '11pt', 
        lineHeight: '1.4',
        backgroundColor: '#ffffff',
        color: '#111827',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header */}
      <div style={{ padding: '32px', backgroundColor: '#5b4cdb' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
          {personalInfo.photo && (
            <img
              src={personalInfo.photo}
              alt={personalInfo.fullName}
              style={{ 
                width: '96px', 
                height: '96px', 
                borderRadius: '50%', 
                objectFit: 'cover',
                border: '4px solid rgba(255,255,255,0.3)',
                flexShrink: 0
              }}
            />
          )}
          <div style={{ flex: 1, color: '#ffffff' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px', color: '#ffffff' }}>
              {personalInfo.fullName || 'Tu Nombre'}
            </h1>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '12px', color: '#ffffff' }}>
              {personalInfo.title || 'Título Profesional'}
            </p>
        
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px' }}>
              {personalInfo.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffffff' }}>
                  <Mail style={{ width: '16px', height: '16px' }} />
                  <span>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffffff' }}>
                  <Phone style={{ width: '16px', height: '16px' }} />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffffff' }}>
                  <MapPin style={{ width: '16px', height: '16px' }} />
                  <span>{personalInfo.location}</span>
                </div>
              )}
              {personalInfo.linkedin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffffff' }}>
                  <Linkedin style={{ width: '16px', height: '16px' }} />
                  <span>{personalInfo.linkedin}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Summary */}
        {personalInfo.summary && (
          <section>
            <h2 style={{ fontSize: '16px', fontWeight: '600', borderBottom: '2px solid #5b4cdb', paddingBottom: '4px', marginBottom: '8px', color: '#5b4cdb' }}>
              Perfil Profesional
            </h2>
            <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.6' }}>{personalInfo.summary}</p>
          </section>
        )}

        {/* Experience */}
        {experiences.length > 0 && (
          <section>
            <h2 style={{ fontSize: '16px', fontWeight: '600', borderBottom: '2px solid #5b4cdb', paddingBottom: '4px', marginBottom: '12px', color: '#5b4cdb' }}>
              Experiencia Laboral
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {experiences.map((exp) => (
                <div key={exp.id} style={{ position: 'relative', paddingLeft: '12px', borderLeft: '2px solid #e5e7eb', pageBreakInside: 'avoid' }}>
                  <div style={{ position: 'absolute', left: '-5px', top: '0', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#5b4cdb' }} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                    <h3 style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>{exp.position}</h3>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {formatDate(exp.startDate)} - {exp.current ? 'Presente' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  <p style={{ fontWeight: '500', marginBottom: '4px', fontSize: '14px', color: '#5b4cdb' }}>{exp.company}</p>
                  {exp.description && (
                    <p style={{ fontSize: '12px', color: '#4b5563', lineHeight: '1.5' }}>{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section>
            <h2 style={{ fontSize: '16px', fontWeight: '600', borderBottom: '2px solid #5b4cdb', paddingBottom: '4px', marginBottom: '12px', color: '#5b4cdb' }}>
              Educación
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {education.map((edu) => (
                <div key={edu.id} style={{ position: 'relative', paddingLeft: '12px', borderLeft: '2px solid #e5e7eb', pageBreakInside: 'avoid' }}>
                  <div style={{ position: 'absolute', left: '-5px', top: '0', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#5b4cdb' }} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>{edu.degree}</h3>
                      <p style={{ fontSize: '14px', color: '#5b4cdb' }}>{edu.institution}</p>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>{edu.field}</p>
                    </div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 style={{ fontSize: '16px', fontWeight: '600', borderBottom: '2px solid #5b4cdb', paddingBottom: '4px', marginBottom: '12px', color: '#5b4cdb' }}>
              Habilidades
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {skills.map((skill) => (
                <div key={skill.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>{skill.name}</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      borderRadius: '9999px', 
                      backgroundColor: '#5b4cdb',
                      width: skill.level === 'expert' ? '100%' : skill.level === 'advanced' ? '75%' : skill.level === 'intermediate' ? '50%' : '25%'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <section>
            <h2 style={{ fontSize: '16px', fontWeight: '600', borderBottom: '2px solid #5b4cdb', paddingBottom: '4px', marginBottom: '12px', color: '#5b4cdb' }}>
              Idiomas
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {languages.map((lang) => (
                <div key={lang.id} style={{ padding: '6px 12px', borderRadius: '9999px', fontSize: '12px', backgroundColor: '#ededfc', color: '#5b4cdb' }}>
                  <span style={{ fontWeight: '500' }}>{lang.name}</span>
                  <span style={{ opacity: 0.8 }}> - {languageLevelText[lang.level]}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* GitHub Footer */}
        {githubProfile && (
          <section style={{ paddingTop: '16px', borderTop: '1px solid #e5e7eb', pageBreakInside: 'avoid' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', borderBottom: '2px solid #5b4cdb', paddingBottom: '4px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#5b4cdb' }}>
              <Github style={{ width: '16px', height: '16px' }} />
              GitHub
            </h2>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
              <img 
                src={githubProfile.avatar_url} 
                alt={githubProfile.name}
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  border: '2px solid #5b4cdb',
                  objectFit: 'cover',
                  flexShrink: 0
                }}
              />
              <div>
                <h3 style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>{githubProfile.name || githubProfile.login}</h3>
                <a 
                  href={githubProfile.html_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ fontSize: '12px', color: '#5b4cdb', textDecoration: 'none' }}
                >
                  @{githubProfile.login}
                </a>
                {githubProfile.bio && (
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{githubProfile.bio}</p>
                )}
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BookOpen style={{ width: '12px', height: '12px' }} />
                    {githubProfile.public_repos} repos
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users style={{ width: '12px', height: '12px' }} />
                    {githubProfile.followers} seguidores
                  </span>
                </div>
              </div>
            </div>

            {githubRepos.length > 0 && (
              <div>
                <h4 style={{ fontWeight: '500', color: '#374151', fontSize: '14px', marginBottom: '8px' }}>Repositorios destacados:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {githubRepos.map((repo) => (
                    <a
                      key={repo.id}
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        display: 'block', 
                        padding: '8px', 
                        borderRadius: '8px', 
                        backgroundColor: '#ededfc', 
                        textDecoration: 'none',
                        maxHeight: '70px',
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{ fontWeight: '500', color: '#111827', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{repo.name}</div>
                      {repo.description && (
                        <p style={{ 
                          fontSize: '10px', 
                          color: '#6b7280', 
                          marginTop: '2px', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: '1.3'
                        }}>{repo.description}</p>
                      )}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '10px', color: '#6b7280' }}>
                        {repo.language && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#5b4cdb' }} />
                            {repo.language}
                          </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Star style={{ width: '9px', height: '9px' }} />
                          {repo.stargazers_count}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
