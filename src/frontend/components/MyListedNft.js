import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card } from 'react-bootstrap'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function MyListedItems({ marketplacegoerli, nftgoerli, marketplacemubmai, nftmubmai, marketplacesepolia, nftsepolia, account, chainIdData }) {
    const [loading, setLoading] = useState(true)
    const [sepoliaListedItems, setsepoliaListedItems] = useState([])
    const [sepoliaSoldItems, setsepoliaSoldItems] = useState([])
    const [sepoliaCancelItems, setsepoliaCancelItems] = useState([])
    const [mumbaiListedItems, setmumbaiListedItems] = useState([])
    const [mumbaiSoldItems, setmumbaiSoldItems] = useState([])
    const [mumbaiCancelItems, setmumbaiCancelItems] = useState([])
    const [goerliListedItems, setgoerliListedItems] = useState([])
    const [goerliSoldItems, setgoerliSoldItems] = useState([])
    const [goerliCancelItems, setgoerliCancelItems] = useState([])

    const loadListedItems = async () => {

        let listedItems = []
        let soldItems = []
        let cancelItems = []

        if (chainIdData.toString() === "11155111") {
            console.log(chainIdData.toString())
            const itemCount1 = await marketplacesepolia.itemCount()
            for (let indx = 1; indx <= itemCount1; indx++) {
                const i = await marketplacesepolia.items(indx)
                if (i.owner.toLowerCase() === account) {
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
                    listedItems.push(item)
                    // Add listed item to sold items array if sold and cancel
                    if (!(i.ready) && i.owner.toLowerCase() === account && i.seller.toLowerCase() === account) {
                        cancelItems.push(item)
                    }
                    if (i.seller.toLowerCase() !== account && i.owner.toLowerCase() === account) {
                        soldItems.push(item);
                    }
                }
            }
            setsepoliaListedItems(listedItems)
            setsepoliaCancelItems(cancelItems)
            setsepoliaSoldItems(soldItems)
            setLoading(false)
        }
        else if (chainIdData.toString() === "80001") {
            const itemCount2 = await marketplacemubmai.itemCount()
            console.log(chainIdData.toString())
            for (let indx = 1; indx <= itemCount2; indx++) {
                const i = await marketplacemubmai.items(indx)
                if (i.owner.toLowerCase() === account) {
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
                    listedItems.push(item)
                    // Add listed item to sold items array if sold and cancel
                    if (!(i.ready) && i.owner.toLowerCase() === account && i.seller.toLowerCase() === account) {
                        cancelItems.push(item)
                    }
                    if (i.seller.toLowerCase() !== account && i.owner.toLowerCase() === account) {
                        soldItems.push(item);
                    }
                }
            }
            setmumbaiListedItems(listedItems)
            setmumbaiCancelItems(cancelItems)
            setmumbaiSoldItems(soldItems)
            setLoading(false)
        }
        else if (chainIdData.toString() === "5") {
            const itemCount3 = await marketplacegoerli.itemCount()
            console.log(chainIdData.toString())
            for (let indx = 1; indx <= itemCount3; indx++) {
                const i = await marketplacegoerli.items(indx)
                if (i.owner.toLowerCase() === account) {
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
                    listedItems.push(item)
                    if (!(i.ready) && i.owner.toLowerCase() === account && i.seller.toLowerCase() === account) {
                        cancelItems.push(item)
                    }
                    if (i.seller.toLowerCase() !== account && i.owner.toLowerCase() === account) {
                        soldItems.push(item);
                    }
                }
            }
            setgoerliListedItems(listedItems)
            setgoerliCancelItems(cancelItems)
            setgoerliSoldItems(soldItems)
            setLoading(false)
        }
        else if (chainIdData.toString() !== "5" && chainIdData.toString() !== "5" && chainIdData.toString() !== "5") {
            toast.error(`Marketplace supports Goerli, Sepolia and Mumbai`, {
                position: "top-right",
                autoClose: 5000,
            });
        }
    }
    const ReEnterItem = async (item) => {
        if (chainIdData.toString() === "11155111") {
            try {
                console.log(chainIdData.toString())
                await (await marketplacesepolia.reEnterNft(nftsepolia.address, item.itemId)).wait()
                loadListedItems()
                toast.success(`NFT is successfully uploaded to marketplace`, {
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
        else if (chainIdData.toString() === "80001") {
            try {
                console.log(chainIdData.toString())
                await (await marketplacemubmai.reEnterNft(nftmubmai.address, item.itemId)).wait()
                loadListedItems()
                toast.success(`NFT is successfully uploaded to marketplace`, {
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
        else if (chainIdData.toString() === "5") {
            try {
                console.log(chainIdData.toString())
                await (await marketplacegoerli.reEnterNft(nftgoerli.address, item.itemId)).wait()
                loadListedItems()
                toast.success(`NFT is successfully uploaded to marketplace`, {
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
        else {
            toast.error(`Marketplace supports Goerli, Mumbai and Sepolia networks!`, {
                position: "top-right",
                autoClose: 5000,
            });
        }
    }
    useEffect(() => {
        loadListedItems()
    }, [])

    if (loading) {
        return (
            <main style={{ padding: "1rem 0" }}>
                <h2>Loading...</h2>
            </main>
        )
    }
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
            <div>
                {sepoliaListedItems.length > 0 || mumbaiListedItems.length > 0 || goerliListedItems.length > 0 ? (
                    <div className="flex justify-center">
                        {sepoliaListedItems.length > 0 ? (
                            <div>
                                <h2>Listed</h2>
                                <Row xs={1} md={2} lg={4} className="g-4 py-3">
                                    {sepoliaListedItems.map((item, idx) => (
                                        <Col key={idx} className="overflow-hidden">
                                            <Card>
                                                <Card.Img variant="top" src={item.image} />
                                                <Card.Footer>
                                                    <h2>{item.name}</h2>
                                                    {ethers.utils.formatEther(item.totalPrice)} ETH
                                                </Card.Footer>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                                <h2>solded NFT</h2>
                                <Row xs={1} md={2} lg={4} className="g-4 py-3">
                                    {sepoliaSoldItems.map((item, idx) => (
                                        <Col key={idx} className="overflow-hidden">
                                            <Card>
                                                <Card.Img variant="top" src={item.image} />
                                                <Card.Footer>
                                                    <h2>{item.name}</h2>
                                                    For {ethers.utils.formatEther(item.totalPrice)} ETH - Recieved{ethers.utils.formatEther(item.price)} ETH
                                                </Card.Footer>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                                <h2>Canceled NFT</h2>
                                <Row xs={1} md={2} lg={4} className="g-4 py-3">
                                    {sepoliaCancelItems.map((item, idx) => (
                                        <Col key={idx} className="overflow-hidden">
                                            <Card>
                                                <Card.Img variant="top" src={item.image} />
                                                <Card.Footer>
                                                    <h2>{item.name}</h2>
                                                    <button className="btn btn-primary mx-1" onClick={() => ReEnterItem(item)} >Re-Enter {ethers.utils.formatEther(item.totalPrice)}</button>
                                                </Card.Footer>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        ) : (
                            <div></div>
                        )}
                        {mumbaiListedItems.length > 0 ? (
                            <div>
                                <h2>Listed</h2>
                                <Row xs={1} md={2} lg={4} className="g-4 py-3">
                                    {mumbaiListedItems.map((item, idx) => (
                                        <Col key={idx} className="overflow-hidden">
                                            <Card>
                                                <Card.Img variant="top" src={item.image} />
                                                <Card.Footer>
                                                    <h2>{item.name}</h2>
                                                    {ethers.utils.formatEther(item.totalPrice)} ETH
                                                </Card.Footer>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                                <h2>solded NFT</h2>
                                <Row xs={1} md={2} lg={4} className="g-4 py-3">
                                    {mumbaiSoldItems.map((item, idx) => (
                                        <Col key={idx} className="overflow-hidden">
                                            <Card>
                                                <Card.Img variant="top" src={item.image} />
                                                <Card.Footer>
                                                    <h2>{item.name}</h2>
                                                    For {ethers.utils.formatEther(item.totalPrice)} ETH - Recieved{ethers.utils.formatEther(item.price)} ETH
                                                </Card.Footer>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                                <h2>Canceled NFT</h2>
                                <Row xs={1} md={2} lg={4} className="g-4 py-3">
                                    {mumbaiCancelItems.map((item, idx) => (
                                        <Col key={idx} className="overflow-hidden">
                                            <Card>
                                                <Card.Img variant="top" src={item.image} />
                                                <Card.Footer>
                                                    <h2>{item.name}</h2>
                                                    <button className="btn btn-primary mx-1" onClick={() => ReEnterItem(item)} >Re-Enter {ethers.utils.formatEther(item.totalPrice)}</button>
                                                </Card.Footer>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        ) : (
                            <div></div>
                        )}

                        {goerliListedItems.length > 0 ? (
                            <div>
                                <h2>Listed</h2>
                                <Row xs={1} md={2} lg={4} className="g-4 py-3">
                                    {goerliListedItems.map((item, idx) => (
                                        <Col key={idx} className="overflow-hidden">
                                            <Card>
                                                <Card.Img variant="top" src={item.image} />
                                                <Card.Footer>
                                                    <h2>{item.name}</h2>
                                                    {ethers.utils.formatEther(item.totalPrice)} ETH
                                                </Card.Footer>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                                <h2>solded NFT</h2>
                                <Row xs={1} md={2} lg={4} className="g-4 py-3">
                                    {goerliSoldItems.map((item, idx) => (
                                        <Col key={idx} className="overflow-hidden">
                                            <Card>
                                                <Card.Img variant="top" src={item.image} />
                                                <Card.Footer>
                                                    <h2>{item.name}</h2>
                                                    For {ethers.utils.formatEther(item.totalPrice)} ETH - Recieved{ethers.utils.formatEther(item.price)} ETH
                                                </Card.Footer>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                                <h2>Canceled NFT</h2>
                                <Row xs={1} md={2} lg={4} className="g-4 py-3">
                                    {goerliCancelItems.map((item, idx) => (
                                        <Col key={idx} className="overflow-hidden">
                                            <Card>
                                                <Card.Img variant="top" src={item.image} />
                                                <Card.Footer>
                                                    <h2>{item.name}</h2>
                                                    <button className="btn btn-primary mx-1" onClick={() => ReEnterItem(item)} >Re-Enter {ethers.utils.formatEther(item.totalPrice)}</button>
                                                </Card.Footer>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        ) : (
                            <div></div>
                        )}
                    </div>
                ) : (
                    <div>
                        <h1>No listed items</h1>
                    </div>
                )}
            </div>
        </div >
    );
}