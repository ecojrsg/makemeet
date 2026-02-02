import { useState, useEffect } from 'react';
import { GitHubProfile, GitHubRepo } from '@/types/cv';

export function useGitHub(username: string | undefined) {
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setProfile(null);
      setRepos([]);
      return;
    }

    const fetchGitHubData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [profileRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`),
          fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=6`)
        ]);

        if (!profileRes.ok) {
          throw new Error('Usuario de GitHub no encontrado');
        }

        const profileData = await profileRes.json();
        const reposData = await reposRes.json();

        setProfile(profileData);
        setRepos(reposData.filter((repo: GitHubRepo) => !repo.fork).slice(0, 5));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos de GitHub');
        setProfile(null);
        setRepos([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchGitHubData, 500);
    return () => clearTimeout(debounceTimer);
  }, [username]);

  return { profile, repos, loading, error };
}
