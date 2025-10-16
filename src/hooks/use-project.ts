import { api } from '@/trpc/react';
import { useLocalStorage } from 'usehooks-ts';
import { useEffect } from 'react';
const useProject = () => {
       const {data:projects}= api.project.getProjects.useQuery();
       const [projectId,setProjectId]= useLocalStorage('gitwit-project-id', '');
       useEffect(() => {
              if (projects && projects.length > 0 && !projectId) {
                     setProjectId(projects[0].id);
              }
       }, [projects, projectId, setProjectId]);
       const project = projects?.find((project: { id: string }) => project.id === projectId);
       return {
        project,
        projects,
        projectId,
        setProjectId,
       };
}
export default useProject
