type CTAProps = {
  title: string
  description: string
  buttonText: string
  buttonLink: string
}

export default function CTA({ title, description, buttonText, buttonLink }: CTAProps) {
  return (
    <div className="bg-pink-50 border border-pink-200 rounded-2xl p-8 my-8 text-center">
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <a
        href={buttonLink}
        className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-3 rounded-full transition"
      >
        {buttonText}
      </a>
    </div>
  )
}
