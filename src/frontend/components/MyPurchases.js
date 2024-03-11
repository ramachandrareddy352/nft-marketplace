import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card } from 'react-bootstrap'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function MyPurchases({ marketplacegoerli, nftgoerli, marketplacemubmai, nftmubmai, marketplacesepolia, nftsepolia, account, chainIdData }) {
    const [loading, setLoading] = useState(true)
    const [sepoliapurchases, setsepoliaPurchases] = useState([])
    const [mumbaipurchases, setMumbaiPurchases] = useState([])
    const [goerlipurchases, setGoerliPurchases] = useState([])

    const loadPurchasedItems = async () => {
        let purchasedItems = []
        if (chainIdData.toString() === "11155111") {
            console.log(chainIdData.toString())
            const itemCount1 = await marketplacesepolia.itemCount()
            for (let indx = 1; indx <= itemCount1; indx++) {
                const i = await marketplacesepolia.items(indx)
                const uri = await nftsepolia.tokenURI(i.tokenId)
                const response = await fetch(uri)
                const metadata = await response.json()
                const totalPrice = await marketplacesepolia.getTotalPrice(i.itemId)
                let item = {
                    totalPrice,
                    price: i.price,
                    itemId: i.itemId,
                    name: metadata.name,
                    description: metadata.description,
                    image: metadata.image
                }
                if (i.owner.toLowerCase() !== account && i.ready === false && i.seller.toLowerCase() === account) {
                    purchasedItems.push(item)
                }
            }
            setsepoliaPurchases(purchasedItems)
            setLoading(false)
        }
        else if (chainIdData.toString() === "80001") {
            const itemCount2 = await marketplacemubmai.itemCount()
            console.log(chainIdData.toString())
            for (let indx = 1; indx <= itemCount2; indx++) {
                const i = await marketplacemubmai.items(indx)
                const uri = await nftmubmai.tokenURI(i.tokenId)
                const response = await fetch(uri)
                const metadata = await response.json()
                const totalPrice = await marketplacemubmai.getTotalPrice(i.itemId)
                let item = {
                    totalPrice,
                    price: i.price,
                    itemId: i.itemId,
                    name: metadata.name,
                    description: metadata.description,
                    image: metadata.image
                }
                if (i.owner.toLowerCase() !== account && i.ready === false && i.seller.toLowerCase() === account) {
                    purchasedItems.push(item)
                }
            }
            setMumbaiPurchases(purchasedItems)
            setLoading(false)
        }
        else if (chainIdData.toString() === "5") {
            const itemCount3 = await marketplacegoerli.itemCount()
            console.log(chainIdData.toString())
            for (let indx = 1; indx <= itemCount3; indx++) {
                const i = await marketplacegoerli.items(indx)
                const uri = await nftgoerli.tokenURI(i.tokenId)
                const response = await fetch(uri)
                const metadata = await response.json()
                const totalPrice = await marketplacegoerli.getTotalPrice(i.itemId)
                let item = {
                    totalPrice,
                    price: i.price,
                    itemId: i.itemId,
                    name: metadata.name,
                    description: metadata.description,
                    image: metadata.image
                }
                if (i.owner.toLowerCase() !== account && i.ready === false && i.seller.toLowerCase() === account) {
                    purchasedItems.push(item)
                }
            }
            setGoerliPurchases(purchasedItems)
            setLoading(false)
        }
        else if (chainIdData.toString() !== "5" && chainIdData.toString() !== "5" && chainIdData.toString() !== "5") {
            toast.error(`Marketplace supports Goerli, Sepolia and Mumbai`, {
                position: "top-right",
                autoClose: 5000,
            });
        }
    }

    useEffect(() => {
        loadPurchasedItems()
    }, [])
    if (loading) {
        return (
            <main style={{ padding: "1rem 0" }}>
                <h2>Loading...</h2>
            </main>
        )
    }
    return (
        <div>
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
            {sepoliapurchases.length > 0 ? (
                <div className="flex justify-center">
                    {sepoliapurchases.length > 0 ? (
                        <div className='container'>
                            <div className="px-5 container">
                                <h2>NFT's sepolia</h2>
                                <Row xs={1} md={2} lg={4} className="g-4 py-5">
                                    {sepoliapurchases.map((item, idx) => (
                                        <Col key={idx} className="overflow-hidden">
                                            <Card>
                                                <Card.Img variant="top" src={item.image} />
                                                <Card.Footer>
                                                    <h2>{item.name}</h2>
                                                    <p>price : {ethers.utils.formatEther(item.totalPrice)}</p>
                                                </Card.Footer>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        </div>
                    ) : (
                        <div></div>
                    )}
                    {mumbaipurchases.length > 0 ? (
                        <div className='container'>
                            <div className="px-5 container">
                                <h2>NFT's mumbai</h2>
                                <Row xs={1} md={2} lg={4} className="g-4 py-5">
                                    {mumbaipurchases.map((item, idx) => (
                                        <Col key={idx} className="overflow-hidden">
                                            <Card>
                                                <Card.Img variant="top" src={item.image} />
                                                <Card.Footer>
                                                    <h2>{item.name}</h2>
                                                    <p>price : {ethers.utils.formatEther(item.totalPrice)}</p>
                                                </Card.Footer>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        </div>
                    ) : (
                        <div></div>
                    )}
                    {goerlipurchases.length > 0 ? (
                        <div className='container'>
                            <div className="px-5 container">
                                <h2>NFT's goerli</h2>
                                <Row xs={1} md={2} lg={4} className="g-4 py-5">
                                    {goerlipurchases.map((item, idx) => (
                                        <Col key={idx} className="overflow-hidden">
                                            <Card>
                                                <Card.Img variant="top" src={item.image} />
                                                <Card.Footer>
                                                    <h2>{item.name}</h2>
                                                    <p>price : {ethers.utils.formatEther(item.totalPrice)}</p>
                                                </Card.Footer>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        </div>
                    ) : (
                        <div></div>
                    )}
                </div>
            ) : (
                <div>
                    <h1>No items</h1>
                </div>
            )
            }
        </div>
    );
}