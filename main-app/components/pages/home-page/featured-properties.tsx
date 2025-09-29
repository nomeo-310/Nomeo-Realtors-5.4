import { featured_properties_text } from '@/assets/texts/blog_texts'
import PropertyCard from '@/components/cards/property-card'
import PropertySkeletons from '@/components/skeletons/property-skeleton'
import EmptyState from '@/components/ui/empty-state'
import ErrorState from '@/components/ui/error-state'
import { apiRequestHandler } from '@/lib/apiRequestHandler'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React from 'react'

export interface ApartmentImage {
  _id: string;
  images: string[];
}

export interface Property {
  _id: string;
  propertyTag: string;
  propertyTypeTag: string;
  propertyIdTag: string;
  city: string;
  state: string;
  propertyPrice: number;
  annualRent: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  furnitureStatus: string;
  facilityStatus: string;
  apartmentImages: ApartmentImage[];
}


const FeaturedProperties = () => {
  const requestProperties = () => axios.get('/api/property/featured-properties');

  const {data, status } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: () => apiRequestHandler(requestProperties),
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false
  });

  const featuredProperties = data?.data as Property[] || [];
  console.log(featuredProperties);

  return (
    <div className='xl:p-16 md:p-10 p-6 flex flex-col xl:gap-10 gap-6 xl:pt-[84px] md:pt-[84px] pt-[84px]' id='featuredProperties'>
      <div className='flex flex-col gap-3'>
        <h2 className='xl:text-3xl md:text-2xl text-lg font-quicksand font-semibold'>{featured_properties_text.title}</h2>
        <p className='text-black/60 dark:text-white/70 text-sm md:text-base'>{featured_properties_text.description}</p>
      </div>
      { status === 'pending' && <PropertySkeletons/> }
      { status === 'error' && 
        <div>
          <ErrorState message='Error occurred while getting featured properties' className='w-fit'/>
        </div>
      }
      { status === 'success' && featuredProperties.length < 1 &&
        <div>
          <EmptyState message='Featured blogs not available at the moment. Check later' className='w-fit'/>
        </div>
      }
      { status === 'success' && featuredProperties.length > 0 &&
        <div className="grid xl:grid-cols-4 xl:gap-3 md:grid-cols-2 md:gap-x-4 md:gap-y-6 lg:gap-y-4 grid-cols-1 gap-5">
          {featuredProperties.map((property: Property) => (
            <PropertyCard
              key={property._id}
              propertyTag={property.propertyTag}
              propertyIdTag={property.propertyIdTag}
              city={property.city}
              state={property.state}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              mainImage={property.apartmentImages[0].images[0]}
              annualRent={property.annualRent}
              propertyPrice={property.propertyPrice}
              squareFootage={property.squareFootage}
              furnitureStatus={property.facilityStatus}
            />
          ))}
        </div>
      }
    </div>
  )
}

export default FeaturedProperties