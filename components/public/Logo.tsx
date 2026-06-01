import Image from 'next/image';
import Link from 'next/link';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={className} aria-label="Fabiano Bratti Empilhadeiras, página inicial">
      <Image
        src="/logo.png"
        alt="Fabiano Bratti Empilhadeiras"
        width={180}
        height={48}
        priority
        className="h-10 w-auto"
      />
    </Link>
  );
}
