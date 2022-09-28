import "../styles/globals.css";
import Link from "next/link";
function Marketplace({ Component, pageProps }) {
  return (
    <div className="w-full y-full bg-[#1a1c1f] flex flex-row">
      <div className="flex-1 h-screen flex flex-col">
        <h1
          className="text-center text-white md:text-6xl font-extrabold tracking-tighter mb-4"
          data-aos="zoom-y-out"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-l from-blue-500 to-teal-400">
            NFT{" "}
          </span>
          Market
        </h1>

        <nav class="flex items-center justify-between flex-wrap">
          <div class="block lg:hidden"></div>
          <div class="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
            <div class="text-sm lg:flex-grow">
              <Link href="/">
                <a class="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                  Home
                </a>
              </Link>
              <Link href="/create-item">
                <a class="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                  Mint NFT
                </a>
              </Link>
              <Link href="my-assets">
                <a class="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                  My NFTs
                </a>
              </Link>
              <Link href="creator-dashboard">
                <a class="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white">
                  Dashboard
                </a>
              </Link>
            </div>
          </div>
        </nav>
        <Component {...pageProps} />
      </div>
    </div>
  );
}
export default Marketplace;
