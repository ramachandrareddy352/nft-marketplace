import { useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Spinner } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { Buffer } from 'buffer'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const projectId = '2N7yp4DUu80pxg5dnzC9t0Pj9dM';
const projectSecret = '38a1af53c42ef43d40476b8f5083db44';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
const client = ipfsHttpClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});

const Create = ({ marketplacegoerli, nftgoerli, marketplacemubmai, nftmubmai, marketplacesepolia, nftsepolia, chainIdData }) => {
    const [image, setImage] = useState('')
    const [price, setPrice] = useState(null)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [networkName, setNetworkName] = useState('') // networkName saves the chainId
    const [networkData, setNetworkData] = useState('') // networkData saves network name
    const [loading, setLoading] = useState(false)

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

    const uploadToIPFS = async (event) => {
        setNetworkInfo()
        event.preventDefault()
        const file = event.target.files[0]
        if (typeof file !== 'undefined') {
            try {
                const result = await client.add(file)
                console.log(result)
                console.log(`${networkData}`)
                setImage(`https://ipfs.io/ipfs/${result.path}`)
            } catch (error) {
                console.log("ipfs image upload error: ", error)
                toast.error(`Unable to upload image to IPFS!`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            }
        }
    }

    const preview = async () => {
        setLoading(false)
        if (networkName === chainIdData.toString()) {
            function clickButton() {
                document.getElementById('previewButton').click();
            }
            clickButton()
        }
        else {
            toast.error(`Please change the network to ${networkData}!`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }
    }
    const createNFT = async () => {
        if (!image || !price || !name || !description || !networkName) {
            toast.error('Please fill all the required fields!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            return
        }
        else {
            try {
                const result = await client.add(JSON.stringify({ name, description, image }))
                mintThenList(result)
            } catch (error) {
                console.log("create uri upload error: ", error)
                toast.error(`Unable to upload metadata to IPFS!`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            }
        }
    }
    const mintThenList = async (result) => {
        setLoading(true)
        console.log(chainIdData.toString())
        const uri = `https://ipfs.io/ipfs/${result.path}`
        console.log(uri);
        // mint nft 
        if ("80001" === chainIdData.toString()) {
            try {
                await (await nftmubmai.mint(uri)).wait()
                const id = await nftmubmai.tokenCount()
                console.log(`${id}`)
                await (await nftmubmai.setApprovalForAll(marketplacemubmai.address, true)).wait()
                const listingPrice = ethers.utils.parseEther(price.toString())
                await (await marketplacemubmai.makeItem(nftmubmai.address, id, listingPrice, parseInt(networkName))).wait()
                toast.success(`NFT is successfully minted on ${networkData} Network`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            }
            catch {
                toast.error('Transction was cancelled MUMBAI!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            }
        }
        else if ("11155111" === chainIdData.toString()) {
            try {
                console.log(uri);
                await (await nftsepolia.mint(uri)).wait()
                const id = await nftsepolia.tokenCount()
                console.log(`${id}`)
                await (await nftsepolia.setApprovalForAll(marketplacesepolia.address, true)).wait()
                const listingPrice = ethers.utils.parseEther(price.toString())
                await (await marketplacesepolia.makeItem(nftsepolia.address, id, listingPrice, parseInt(networkName))).wait()
                toast.success(`NFT is successfully minted on ${networkData} Network`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            }
            catch {
                toast.error('Transction was cancelled SEPOLIA!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            }
        }
        else if ("5" === chainIdData.toString()) {
            try {
                console.log(uri);
                await (await nftgoerli.mint(uri)).wait()
                const id = await nftgoerli.tokenCount()
                console.log(`${id}`)
                await (await nftgoerli.setApprovalForAll(marketplacegoerli.address, true)).wait()
                const listingPrice = ethers.utils.parseEther(price.toString())
                await (await marketplacegoerli.makeItem(nftgoerli.address, id, listingPrice, parseInt(networkName))).wait()
                toast.success(`NFT is successfully minted on ${networkData} Network`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            }
            catch {
                toast.error('Transction was cancelled GOERLI!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            }
        }
        setDescription('')
        setImage('')
        setName('')
        setPrice(null)
        setNetworkName('')
        setLoading(false)
    }

    const totalPrice = price * ((100 + price) / 100);

    return (
        <div className="container-fluid mt-5">
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


            <div className="row">
                <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '800px' }}>
                    <div className="content mx-auto">
                        <Row className="g-4">
                            <div className="card" style={{ width: "18rem", height: "22rem", justifyContent: "center", borderRadius: "5%", border: "2px dashed black" }}>
                                <img src={image} className="card-img-top" alt="image_Preview" />
                            </div>
                            <Form.Control
                                type="file"
                                required
                                name="file"
                                accept='.png, .jpg, .jpeg'
                                onChange={uploadToIPFS}
                            />
                            <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
                            <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
                            <Form.Control onChange={(e) => setNetworkName(e.target.value)} size="lg" required
                                as="select" >
                                <option value="0">Select the Network Type</option>
                                <option value="5">Goerli</option>
                                <option value="80001">Mumbai</option>
                                <option value="11155111">Sepolia</option>
                            </Form.Control>
                            <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
                            <div className="d-grid px-0">
                                <button type="button" className="btn btn-primary" size="lg" onClick={preview}>
                                    Preview
                                </button>
                            </div>
                        </Row>
                    </div>
                </main>
            </div>

            {/* Preview image */}
            <div>
                {!loading ? (
                    <div>
                        <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#staticBackdrop" id="previewButton" style={{ display: "none" }}>
                            Launch static backdrop modal
                        </button>
                        <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                            <div className="modal-dialog modal-dialog-centered ">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h1 className="modal-title fs-5" id="staticBackdropLabel"><strong>Preview NFT</strong></h1>
                                    </div>
                                    <div className="modal-dialog ">
                                        <div className="card" style={{ width: "18rem" }}>
                                            <img src={image} className="card-img-top" alt="..." />
                                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ width: '5rem' }}>
                                                <strong>{networkData}</strong>
                                            </span>
                                            <div className="card-body">
                                                <h5 className="card-title">{name}</h5>
                                                <p className="card-text">{description}</p>
                                                <div className='my-2'>
                                                    <button className="btn btn-primary mx-2 ">Edit Price</button>
                                                    <button className="btn btn-primary mx-3">Cancel NFT</button>
                                                </div>
                                                <button className="btn btn-primary mx-2 " style={{ width: '13.5rem' }}>Buy {totalPrice} ETH</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer" >
                                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" >Edit</button>
                                        <button type="button" onClick={createNFT} className="btn btn-primary">Mint NFT</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#staticBackdrop" id="previewButton" style={{ display: "none" }}>
                            Launch static backdrop modal
                        </button>
                        <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                            <div className="modal-dialog modal-dialog-centered ">
                                <div className="modal-content">
                                    <div className="modal-header" style={{ justifyContent: 'center' }}>
                                        <p className="modal-title fs-5" id="staticBackdropLabel">
                                            <Spinner animation="border" style={{ margin: "0px 15px" }} /><strong>Please wait ...</strong></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    )
}

export default Create