import Image from "next/image";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center px-4">
      <nav className="w-full flex justify-between items-center p-4 bg-black">
        <div className="text-white text-xl font-bold">
          <span className="text-green-500">Eco</span>Deli
        </div>
        <div>
          <Link href="/connexion" className="bg-green-600 px-4 py-2 rounded-lg text-black font-semibold mr-2">
            Connexion
          </Link>
          <Link href="/inscription" className="bg-green-600 px-4 py-2 rounded-lg text-black font-semibold mr-2">
            Inscription
          </Link>
        </div>
      </nav>

      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-5xl mt-10">
        <div className="text-left max-w-lg">
          <h1 className="text-3xl md:text-5xl font-bold">
            Un envoi <span className="text-green-500">Simple</span> et <span className="text-green-500">écologique</span>
            <br /> à petit prix
          </h1>
          <p className="mt-4 text-gray-400">A remplir ---------------------------------------------</p>
          <div className="mt-6">
            <button className="bg-green-600 px-6 py-2 rounded-lg text-black font-semibold mr-2">Une question ?</button>
            <Link href="/inscription" className="bg-green-600 px-4 py-2 rounded-lg text-black font-semibold mr-2">
              Inscription
            </Link>
          </div>
        </div>
        <div className="mt-10 md:mt-0">
          <Image src="/logo_side.png" alt="EcoDeli logo" width={400} height={400} className="rounded-lg" />
        </div>
      </div>
    </div>
  );
}
