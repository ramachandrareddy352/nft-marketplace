import React from 'react'
import './CreateNft.css'
import image2 from '../images/image-2.webp'

function CreateNft() {
    return (
        <div className='division'>
            <div className='left'>
                <h2>Create your own NFT here</h2>
                <p>Create your own NFT hereCreate your own NFT hereCreate your own NFT hereCreate your own NFT hereCreate your own NFT hereCreate your own NFT hereCreate your own NFT hereCreate your own NFT hereCreate your own NFT here</p>
                <button type="button" className="btn btn-primary btn-lg">Large button</button>
            </div>
            <div className='right'>
                <img src={image2} alt="image2"></img>
            </div>
        </div>
    )
}

export default CreateNft