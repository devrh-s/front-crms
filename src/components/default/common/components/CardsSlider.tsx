import Slider from 'react-slick';
import { IconButton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface CardsSliderProps {
  children: JSX.Element | JSX.Element[];
}

function SampleNextArrow(props: any) {
  const { onClick } = props;
  return (
    <IconButton
      sx={{
        position: 'absolute',
        top: '50%',
        translateX: '-50%',
        right: '-10px',
        zIndex: 50,
      }}
      onClick={onClick}
    >
      <ChevronRightIcon />
    </IconButton>
  );
}

function SamplePrevArrow(props: any) {
  const { onClick } = props;
  return (
    <IconButton
      sx={{
        position: 'absolute',
        top: '50%',
        translateX: '-50%',
        left: '-10px',
        zIndex: 50,
      }}
      onClick={onClick}
    >
      <ChevronLeftIcon />
    </IconButton>
  );
}

export default function CardsSlider({ children }: CardsSliderProps) {
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };
  return <Slider {...sliderSettings}>{children}</Slider>;
}
