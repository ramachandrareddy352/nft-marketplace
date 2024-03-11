import React from 'react'
import ImageSlider from './ImageSlider'
import CreateNft from './CreateNft'
import Others from './Others'
import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, Route } from "react-router-dom";


const Home = ({ marketplacegoerli, nftgoerli, marketplacemubmai, nftmubmai, marketplacesepolia, nftsepolia, account, chainIdData }) => {

    const [goerliItems, goerliSetItems] = useState([])
    const [mumbaiItems, mumbaiSetItems] = useState([])
    const [sepoliaItems, sepoliaSetItems] = useState([])
    const [networkData, setNetworkData] = useState('')
    const [loading, setLoading] = useState(true)

    async function setNetworkInfo() {
        if (chainIdData.toString() === "5") {
            setNetworkData("Goerli")
        }
        else if (chainIdData.toString() === "80001") {
            setNetworkData("Mumbai")
        }
        else if (chainIdData.toString() === "11155111") {
            setNetworkData("Sepolia")
        }
        console.log(chainIdData.toString())
        console.log(networkData)
    }

    const loadMarketplaceItems = async () => {
        await setNetworkInfo()
        let items1 = []
        if (chainIdData.toString() === "11155111") {
            console.log(chainIdData.toString())
            const itemCount1 = await nftsepolia.tokenCount()
            console.log(`${itemCount1}`)
            for (let i = 1; i <= itemCount1; i++) {
                const item = await marketplacesepolia.items(i)
                if (item.ready) {
                    const uri = await nftsepolia.tokenURI(item.tokenId)
                    const response = await fetch(uri)
                    const metadata = await response.json()
                    const totalPrice = await marketplacesepolia.getTotalPrice(item.itemId)
                    items1.push({
                        totalPrice,
                        itemId: item.itemId,
                        seller: item.seller,
                        name: metadata.name,
                        description: metadata.description,
                        image: metadata.image
                    })
                }
            }
            sepoliaSetItems(items1)
            setLoading(false)
        }
        else if (chainIdData.toString() === "80001") {
            const itemCount2 = await nftmubmai.tokenCount()
            console.log(`${itemCount2}`)
            for (let i = 1; i <= itemCount2; i++) {
                const item = await marketplacemubmai.items(i)
                if (item.ready) {
                    const uri = await nftmubmai.tokenURI(item.tokenId)
                    const response = await fetch(uri)
                    const metadata = await response.json()
                    const totalPrice = await marketplacemubmai.getTotalPrice(item.itemId)
                    items1.push({
                        totalPrice,
                        itemId: item.itemId,
                        seller: item.seller,
                        name: metadata.name,
                        description: metadata.description,
                        image: metadata.image
                    })
                }
            }
            mumbaiSetItems(items1)
            setLoading(false)
        }
        else if (chainIdData.toString() === "5") {
            const itemCount3 = await nftgoerli.tokenCount()
            console.log(`${itemCount3}`)
            for (let i = 1; i <= itemCount3; i++) {
                const item = await marketplacegoerli.items(i)
                if (item.ready) {
                    const uri = await nftgoerli.tokenURI(item.tokenId)
                    const response = await fetch(uri)
                    const metadata = await response.json()
                    const totalPrice = await marketplacegoerli.getTotalPrice(item.itemId)
                    items1.push({
                        totalPrice,
                        itemId: item.itemId,
                        seller: item.seller,
                        name: metadata.name,
                        description: metadata.description,
                        image: metadata.image
                    })
                }
            }
            goerliSetItems(items1)
            setLoading(false)
        }
        else if (chainIdData.toString() !== "5" && chainIdData.toString() !== "5" && chainIdData.toString() !== "5") {
            toast.error(`Marketplace supports Goerli, Sepolia and Mumbai`, {
                position: "top-right",
                autoClose: 5000,
            });
        }
    }

    //buy nft
    const buyMarketItem = async (item) => {
        if (chainIdData.toString() === "11155111" && item.seller.toLowerCase() !== account) {
            try {
                await (await marketplacesepolia.purchaseItem(nftsepolia.address, item.itemId, { value: item.totalPrice })).wait()
                loadMarketplaceItems()
                toast.success(`Bought NFT successfully`, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
            catch {
                toast.error(`Transaction was cancelled`, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        }
        else if (chainIdData.toString() === "80001" && item.seller.toLowerCase() !== account) {
            try {
                await (await marketplacemubmai.purchaseItem(nftmubmai.address, item.itemId, { value: item.totalPrice })).wait()
                loadMarketplaceItems()
                toast.success(`Bought NFT successfully`, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
            catch {
                toast.error(`Transaction was cancelled`, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        }
        else if (chainIdData.toString() === "5" && item.seller.toLowerCase() !== account) {
            try {
                await (await marketplacegoerli.purchaseItem(nftgoerli.address, item.itemId, { value: item.totalPrice })).wait()
                loadMarketplaceItems()
                toast.success(`Bought NFT successfully`, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
            catch {
                toast.error(`Transaction was cancelled`, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        }
        else if (item.seller.toLowerCase() === account) {
            toast.error(`You cannot buy your own NFT `, {
                position: "top-right",
                autoClose: 5000,
            });
        }
        else {
            toast.error(`Please change the nsetwork to ${networkData}`, {
                position: "top-right",
                autoClose: 5000,
            });
        }
    }
    // edit price
    const editPriceItem = async (item) => {
        if (chainIdData.toString() === "11155111" && item.seller.toLowerCase() === account) {
            const editPrice = window.prompt("Enter the Price : ");
            const listingPrice = ethers.utils.parseEther(editPrice)
            try {
                await (await marketplacesepolia.editPrice(item.itemId, listingPrice)).wait()
                loadMarketplaceItems()
                toast.success(`Price was changed to ${editPrice} ethers`, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
            catch {
                toast.error(`Transaction was cancelled`, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        }
        else if (chainIdData.toString() === "80001" && item.seller.toLowerCase() === account) {
            const editPrice = window.prompt("Enter the Price : ");
            const listingPrice = ethers.utils.parseEther(editPrice)
            try {
                await (await marketplacemubmai.editPrice(item.itemId, listingPrice)).wait()
                loadMarketplaceItems()
                toast.success(`Price was changed to ${editPrice} ethers`, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
            catch {
                toast.error(`Transaction was cancelled`, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        }
        else if (chainIdData.toString() === "5" && item.seller.toLowerCase() === account) {
            const editPrice = window.prompt("Enter the Price : ");
            const listingPrice = ethers.utils.parseEther(editPrice)
            try {
                await (await marketplacegoerli.editPrice(item.itemId, listingPrice)).wait()
                loadMarketplaceItems()
                toast.success(`Price was changed to ${editPrice} ethers`, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
            catch {
                toast.error(`Transaction was cancelled`, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        }
        else if (item.seller.toLowerCase() !== account) {
            toast.error(`You are not the owner of NFT!`, {
                position: "top-right",
                autoClose: 5000,
            });
        }
    }
    // cancel nft
    const cancetItem = async (item) => {
        if (chainIdData.toString() === "11155111" && item.seller.toLowerCase() === account) {
            try {
                await (await marketplacesepolia.cancelNft(nftsepolia.address, item.itemId)).wait()
                loadMarketplaceItems()
                toast.success(`Nft was removed from marketplace`, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
            catch {
                toast.error(`Transaction was cancelled`, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        }
        else if (chainIdData.toString() === "80001" && item.seller.toLowerCase() === account) {
            try {
                await (await marketplacemubmai.cancelNft(nftmubmai.address, item.itemId)).wait()
                loadMarketplaceItems()
                toast.success(`Nft was removed from marketplace`, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
            catch {
                toast.error(`Transaction was cancelled`, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        }
        else if (chainIdData.toString() === "5" && item.seller.toLowerCase() === account) {
            try {
                await (await marketplacegoerli.cancelNft(nftgoerli.address, item.itemId)).wait()
                loadMarketplaceItems()
                toast.success(`Nft was removed from marketplace`, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
            catch {
                toast.error(`Transaction was cancelled`, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        }
        else if (item.seller.toLowerCase() !== account) {
            console.log("errorgbhnjmk,")
            toast.error(`You are not the owner of NFT!`, {
                position: "top-right",
                autoClose: 5000,
            });
        }
    }

    useEffect(() => {
        loadMarketplaceItems()
    }, [])

    if (loading) return (
        <main style={{ padding: "1rem 0" }}>
            <h2>Loading...</h2>
        </main>
    )

    return (
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
            <div className='container'>
                <ImageSlider />
            </div>
            <div className='container'>
                <CreateNft />
            </div>
            <hr />
            {sepoliaItems.length > 0 || mumbaiItems.length > 0 || goerliItems.length > 0 ? (
                <div className="flex justify-center">
                    {/*Goerli NFT*/}
                    {goerliItems.length > 0 ? (
                        <div className='px-5 container'>
                            <h2>goerli</h2>
                            <Row xs={1} md={2} lg={4} className="g-4 py-5">
                                {goerliItems.map((item, idx) => (
                                    <Col key={idx} className="overflow-hidden">
                                        <Card>
                                            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ width: "5rem", }}>
                                                <strong><b>{networkData}</b></strong>
                                            </span>
                                            <Card.Img variant="top" src={item.image} />
                                            <Card.Body color="secondary">
                                                <Card.Title>{item.name}</Card.Title>
                                                <Card.Text>
                                                    {item.description}
                                                </Card.Text>
                                            </Card.Body>
                                            <Card.Footer>
                                                <div className='my-2' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Button variant='primary' onClick={() => editPriceItem(item)} className='mx-2' >Edit Price</Button>
                                                    <Button variant='primary' onClick={() => cancetItem(item)} className='mx-2'>Cancel NFT</Button>
                                                </div>
                                                <div className='d-grid'>
                                                    <Button onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                                                        Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                                                    </Button>
                                                </div>
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    ) : (
                        <div>
                            <span></span>
                        </div>
                    )}
                    {/*Sepolia NFT*/}
                    {sepoliaItems.length > 0 ? (
                        <div className="px-5 container">
                            <h2>sepolia</h2>
                            <Row xs={1} md={2} lg={4} className="g-4 py-5">
                                {sepoliaItems.map((item, idx) => (
                                    <Col key={idx} className="overflow-hidden">
                                        <Card>
                                            <Card.Img variant="top" src={item.image} />
                                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ width: '5rem' }}>
                                                <strong>{networkData}</strong>
                                            </span>
                                            <Card.Body color="secondary">
                                                <Card.Title>{item.name}</Card.Title>
                                                <Card.Text>
                                                    {item.description}
                                                </Card.Text>
                                            </Card.Body>
                                            <Card.Footer>
                                                <div className='my-2' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Button variant='primary' onClick={() => editPriceItem(item)} className='mx-2' >Edit Price</Button>
                                                    <Button variant='primary' onClick={() => cancetItem(item)} className='mx-2'>Cancel NFT</Button>
                                                </div>
                                                <div className='d-grid'>
                                                    <Button onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                                                        Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                                                    </Button>
                                                </div>
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    ) : (
                        <div>
                            <span></span>
                        </div>
                    )}
                    {/*Mumbai NFT*/}
                    {mumbaiItems.length > 0 ? (
                        <div>
                            <hr />
                            <h2>mumbai</h2>
                            <Row xs={1} md={2} lg={4} className="g-4 py-5">
                                {mumbaiItems.map((item, idx) => (
                                    <Col key={idx} className="overflow-hidden">
                                        <Card>
                                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ width: '5rem' }}>
                                                <strong>{networkData}</strong>
                                            </span>
                                            <Card.Img variant="top" src={item.image} />
                                            <Card.Body color="secondary">
                                                <Card.Title>{item.name}</Card.Title>
                                                <Card.Text>
                                                    {item.description}
                                                </Card.Text>
                                            </Card.Body>
                                            <Card.Footer>
                                                <div className='my-2' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Button variant='primary' onClick={() => editPriceItem(item)} className='mx-2' >Edit Price</Button>
                                                    <Button variant='primary' onClick={() => cancetItem(item)} className='mx-2'>Cancel NFT</Button>
                                                </div>
                                                <div className='d-grid'>
                                                    <Button onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                                                        Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                                                    </Button>
                                                </div>
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    ) : (
                        <div>
                            <span></span>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <h1>Empty at {networkData} marketplace!</h1>
                </div>
            )}
            <hr />
            <div className='container'>
                <Others />
            </div>
        </div >
    )
}
export default Home