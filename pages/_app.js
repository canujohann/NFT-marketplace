import "../styles/globals.css";
import Link from "next/link";

function LinkMenu({ url, title }) {
  return (
    <Link href={url}>
      <a className="text-xl block m-4 lg:inline-block lg:mt-0 text-black hover:text-slate-500">
        {title}
      </a>
    </Link>
  );
}
function Marketplace({ Component, pageProps }) {
  return (
    <div className="container p-5 m-5">
      <div className="flex-1 h-screen flex flex-col">
        {/* Main title */}
        <h1
          className="text-center text-black md:text-6xl font-extrabold tracking-tighter mb-4"
          data-aos="zoom-y-out"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-l from-blue-500 to-teal-400">
            NFT{" "}
          </span>
          Market
        </h1>

        {/* Menu */}
        <nav className="flex items-center justify-between flex-wrap">
          <div className="block lg:hidden"></div>
          <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
            <LinkMenu url="/" title="Home" />
            <LinkMenu url="/create-item" title="Mint NFT" />
            <LinkMenu url="my-assets/" title="My NFT" />
            <LinkMenu url="/creator-dashboard" title="Dashboard" />
          </div>
        </nav>
        <Component {...pageProps} />
      </div>
    </div>
  );
}
export default Marketplace;
