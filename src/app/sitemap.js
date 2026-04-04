// app/sitemap.js

export default function sitemap() {
  // Replace with your actual production URL
  const baseUrl = 'https://hommily.vercel.app'; 

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: .5,
    },
    {
      url: `${baseUrl}/feeds`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.1,
    },
    {
      url: `${baseUrl}/display`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/music`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }
    // Add more URLs here
  ];
}
