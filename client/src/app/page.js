import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content min-w-screen flex-col lg:justify-between lg:px-20 lg:flex-row-reverse">
        <Image
          src="/hero_image.png"
          className="max-w-sm rounded-lg shadow-2xl"
          height={500}
          width={500}
        />
        <div>
          <h1 className="text-5xl font-bold">Resolvio</h1>
          <p className="py-6">
            Resolvio is a decentralized complaint resolution platform built on the Ethereum blockchain.
            Start resolving complaints today!
          </p>
          <Link className="btn btn-primary" href="/auth">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
