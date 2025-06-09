'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';


const getUserInfo = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('Aucun token trouvé dans le localStorage');
    return null;
  }

  try {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    console.log('Token décodé : ', decodedToken);
    return decodedToken;
  } catch (e) {
    console.error('Erreur lors du décodage du token', e);
    return null;
  }
};


const DashboardPage: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    const user = getUserInfo();

    if (user && user.userStatus) {
      console.log('UserStatus récupéré : ', user.userStatus);

      switch (user.userStatus) {
        case 'admin':
          router.push('/dashboard/admin');
          break;
        case 'client':
          router.push('/dashboard/client');
          break;
        case 'livreur':
          router.push('/dashboard/livreur');
          break;
        case 'prestataire':
          if (user.valid === true) {
            router.push('/dashboard/prestataire');
          } else {
            router.push('/dashboard/prestataire/documents');
          }
          break;
        case 'commercant':
          router.push('/dashboard/shopkeeper');
          break;
        default:
          alert('Accès interdit');
          router.push('/');
          break;
      }
    } else {
      console.log('Aucun userStatus, redirection vers la page de connexion');
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">Redirection...</h1>
    </div>
  );
};

export default DashboardPage;
