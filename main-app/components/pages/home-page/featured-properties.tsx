import PropertyCard from '@/components/cards/property-card'
import React from 'react'

const FeaturedProperties = () => {
  return (
    <div className='xl:p-16 md:p-10 p-6 flex flex-col xl:gap-10 gap-6 xl:pt-[84px] md:pt-[84px] pt-[84px]' id='featuredProperties'>
      <div className='flex flex-col gap-3'>
        <h2 className='xl:text-3xl md:text-2xl text-lg font-quicksand font-semibold'>Featured Properties</h2>
        <p className='text-black/60 dark:text-white/70 text-sm md:text-base'>Browse our featured listings below to get a glimpse of what we offer. From modern apartments in desirable neighborhoods to luxurious homes with stunning amenities, we're confident you'll find a property that captures your heart.</p>
      </div>
      <div className="grid xl:grid-cols-4 xl:gap-3 md:grid-cols-2 md:gap-x-4 md:gap-y-6 lg:gap-y-4 grid-cols-1 gap-5">
        <PropertyCard
          propertyTag='for-rent'
          propertyIdTag="aprtment-wed123"
          city="Lekki"
          state="Lagos"
          bedrooms={3}
          bathrooms={2}
          mainImage="/images/image_1.png"
          annualRent={2000000}
          propertyPrice={undefined}
          squareFootage={410}
          furnitureStatus='furnished'
        />
        <PropertyCard
          propertyTag='for-sale'
          propertyIdTag="aprtment-dex123"
          city="Ikotun"
          state="Lagos"
          bedrooms={4}
          bathrooms={3}
          mainImage="/images/image_2.png"
          annualRent={0}
          propertyPrice={45000000}
          squareFootage={510}
          furnitureStatus='furnished'
        />
        <PropertyCard
          propertyTag='for-rent'
          propertyIdTag="aprtment-wed123"
          city="Abeokuta"
          state="Ogun"
          bedrooms={3}
          bathrooms={2}
          mainImage="/images/image_3.png"
          annualRent={2000000}
          propertyPrice={undefined}
          squareFootage={440}
          furnitureStatus='furnished'
        />
        <PropertyCard
          propertyTag='for-sale'
          propertyIdTag="aprtment-ged123"
          city="Ojota"
          state="Lagos"
          bedrooms={4}
          bathrooms={3}
          mainImage="/images/image_4.png"
          annualRent={0}
          propertyPrice={35000000}
          squareFootage={470}
          furnitureStatus='non furnished'
        />
      </div>
    </div>
  )
}

export default FeaturedProperties