import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/testimonials.css";
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa";
import { MdArrowBack, MdArrowForward } from "react-icons/md";

const testimonials = [
    {
        name: "Sita Devi",
        text: "Sakhi Pay has empowered me to manage my finances confidently. The education tools are invaluable!",
        image: "/images/woman_1.jpg",
    },
    {
        name: "Sukumari Patel",
        text: "I never trusted digital payments before, but now I use UPI daily thanks to Sakhi Pay’s training.",
        image: "/images/woman_2.jpg",
    },
    {
        name: "Sunita Kumari",
        text: "Budgeting was always a challenge, but now I can plan my expenses wisely with Sakhi Pay.",
        image: "/images/woman_3.jpg",
    },
    {
        name: "Preeti Singh",
        text: "The ease of transactions and security of the platform have truly improved my financial independence.",
        image: "/images/woman_4.jpg",
    },
    {
        name: "Meena Sharma",
        text: "I love how easy and safe digital payments have become for me. Sakhi Pay is truly life-changing!",
        image: "/images/woman_5.jpg",
    }
];

const CustomPrevArrow = (props) => {
    const { onClick } = props;
    return (
        <div className="custom-arrow left-arrow" onClick={onClick}>
            <MdArrowBack />
        </div>
    );
};

const CustomNextArrow = (props) => {
    const { onClick } = props;
    return (
        <div className="custom-arrow right-arrow" onClick={onClick}>
            <MdArrowForward />
        </div>
    );
};

const Testimonials = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 600,
        slidesToShow: 2,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        arrows: true,
        prevArrow: <CustomPrevArrow />,
        nextArrow: <CustomNextArrow />,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1, 
                },
            },
        ],
    };

    return (
        <section className="testimonials">
            <h2 className="testimonial-title">Trusted by Thousands of Happy Customers</h2>
            <p className="testimonial-subline">
                These are the stories of our customers who have joined us with great pleasure when using this amazing platform.
            </p>
            <Slider {...settings}>
                {testimonials.map((testimonial, index) => (
                    <div key={index} className="testimonial-card">
                        <FaQuoteLeft className="quote-icon left" />
                        <p className="testimonial-text">{testimonial.text}</p>
                        <FaQuoteRight className="quote-icon right" />
                        <img src={testimonial.image} alt={testimonial.name} className="testimonial-image" />
                        <h3 className="testimonial-name">{testimonial.name}</h3>
                    </div>
                ))}
            </Slider>
        </section>
    );
};

export default Testimonials;
