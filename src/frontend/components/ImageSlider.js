import React, { Component } from 'react'
import image1 from '../images/image-1.webp'
import image2 from '../images/image-2.webp'
import image3 from '../images/image-3.webp'

export class ImageSlider extends Component {

    render() {
        return (
            <div className='container my-5'>
                <div id="carouselExampleAutoplaying" class="carousel slide" data-bs-ride="carousel">
                    <div class="carousel-inner">
                        <div class="carousel-item active">
                            <img src={image1} class="d-block w-100" height="400px" alt="..." />
                        </div>
                        <div class="carousel-item">
                            <img src={image2} class="d-block w-100" height="400px" alt="..." />
                        </div>
                        <div class="carousel-item">
                            <img src={image3} class="d-block w-100" height="400px" alt="..." />
                        </div>
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Next</span>
                    </button>
                </div>
            </div>

        )
    }
}

export default ImageSlider