import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { ethers } from 'ethers';
import { Spinner } from 'react-bootstrap'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// components pages
import Navbar from './Navbar'
import Home from './Home'
import Create from './Create'
import MyListedItems from './MyListedNft'
import MyPurchases from './MyPurchases'
// deploying data
import marketplaceAbi from '../../backend/artifacts/src/backend/contracts/Marketplace.sol/marketplace.json'
import nftAbi from '../../backend/artifacts/src/backend/contracts/NFT.sol/NFT.json'
import marketGoerli from '../contractsData/marketplace-goerli-address.json'
import marketMumbai from '../contractsData/marketplace-mumbai-address.json'
import marketSepolia from '../contractsData/marketplace-sepolia-address.json'
import nftGoerli from '../contractsData/nft-goerli-address.json'
import nftMumbai from '../contractsData/nft-mumbai-address.json'
import nftSepolia from '../contractsData/nft-sepolia-address.json'

function App() {

  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [nftgoerli, setNFTgoerli] = useState({})
  const [marketplacegoerli, setMarketplacegoerli] = useState({})
  const [nftsepolia, setNFTsepolia] = useState({})
  const [marketplacesepolia, setMarketplacesepolia] = useState({})
  const [nftmubmai, setNFTmubmai] = useState({})
  const [marketplacemubmai, setMarketplacemubmai] = useState({})
  const [chainIdData, setNetworkId] = useState(null)
  // MetaMask Login/Connect
  const web3Handler = async () => {
    if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0])
      const provider = new ethers.providers.Web3Provider(window.ethereum)     // Get provider from Metamask
      const signer = provider.getSigner()      // Set signer

      const network = await provider.getNetwork()
      setNetworkId(network.chainId)

      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      })

      window.ethereum.on('accountsChanged', async function (accounts) {
        setAccount(accounts[0])
        await web3Handler()
      })
      loadContracts(signer)
    }
    else {
      toast.error(`Please install Metamask`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }
  const loadContracts = async (signer) => {

    const marketplaceG = new ethers.Contract(marketGoerli.address, marketplaceAbi.abi, signer)
    setMarketplacegoerli(marketplaceG)
    const nftG = new ethers.Contract(nftGoerli.address, nftAbi.abi, signer)
    setNFTgoerli(nftG)
    //-----------------
    const marketplaceM = new ethers.Contract(marketMumbai.address, marketplaceAbi.abi, signer)
    setMarketplacemubmai(marketplaceM)
    const nftM = new ethers.Contract(nftMumbai.address, nftAbi.abi, signer)
    setNFTmubmai(nftM)
    //------------------
    const marketplaceS = new ethers.Contract(marketSepolia.address, marketplaceAbi.abi, signer)
    setMarketplacesepolia(marketplaceS)
    const nftS = new ethers.Contract(nftSepolia.address, nftAbi.abi, signer)
    setNFTsepolia(nftS)
    //------------------
    setLoading(false)
  }

  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className='AppPage'>
        <Navbar web3Handler={web3Handler} account={account} />
      </div>
      <div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <Spinner animation="border" style={{ display: 'flex' }} />
            <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
          </div>
        ) : (
          <div className='container'>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            <Routes>
              <Route path="/" element={
                <Home marketplacegoerli={marketplacegoerli} nftgoerli={nftgoerli}
                  marketplacemubmai={marketplacemubmai} nftmubmai={nftmubmai}
                  marketplacesepolia={marketplacesepolia} nftsepolia={nftsepolia}
                  account={account} chainIdData={chainIdData} />
              } />
              <Route path="/create" element={
                <Create marketplacegoerli={marketplacegoerli} nftgoerli={nftgoerli}
                  marketplacemubmai={marketplacemubmai} nftmubmai={nftmubmai}
                  marketplacesepolia={marketplacesepolia} nftsepolia={nftsepolia} chainIdData={chainIdData} />
              } />
              <Route path="/my-listed-items" element={
                <MyListedItems marketplacegoerli={marketplacegoerli} nftgoerli={nftgoerli}
                  marketplacemubmai={marketplacemubmai} nftmubmai={nftmubmai}
                  marketplacesepolia={marketplacesepolia} nftsepolia={nftsepolia}
                  account={account} chainIdData={chainIdData} />
              } />
              <Route path="/my-purchases" element={
                <MyPurchases marketplacegoerli={marketplacegoerli} nftgoerli={nftgoerli}
                  marketplacemubmai={marketplacemubmai} nftmubmai={nftmubmai}
                  marketplacesepolia={marketplacesepolia} nftsepolia={nftsepolia}
                  account={account} chainIdData={chainIdData} />
              } />
            </Routes><hr />
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
