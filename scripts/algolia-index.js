const { createClient } = require('@sanity/client');

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'mavn812v';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '6PKMU3K0JI';
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY || '';
const ALGOLIA_INDEX_NAME = 'blog-posts';

const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
});

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function indexBlogPosts() {
  if (!ALGOLIA_ADMIN_KEY) {
    console.error('ALGOLIA_ADMIN_KEY environment variable is required');
    process.exit(1);
  }

  const { algoliasearch } = await import('algoliasearch');
  const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);

  console.log('Fetching posts from Sanity...');
  const posts = await sanityClient.fetch(
    `*[_type == "post" && status == "published"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      body,
      publishedAt,
      "author": author->{name, slug},
      "category": category->{title, slug},
      "featuredImage": coalesce(featuredImage.asset->url, featuredImage),
      featuredImageAlt,
      metaTitle,
      metaDescription,
      focusKeyword,
      keywords,
      language
    }`
  );

  console.log(`Found ${posts.length} published posts`);

  if (posts.length === 0 && process.env.NODE_ENV !== 'production') {
    console.log('No published posts found. Trying without status filter (dev only)...');
    const allPosts = await sanityClient.fetch(
      `*[_type == "post"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        excerpt,
        body,
        publishedAt,
        "author": author->{name, slug},
        "category": category->{title, slug},
        "featuredImage": coalesce(featuredImage.asset->url, featuredImage),
        featuredImageAlt,
        metaTitle,
        metaDescription,
        focusKeyword,
        keywords,
        language
      }`
    );
    console.log(`Found ${allPosts.length} total posts (all statuses)`);
    posts.push(...allPosts);
  } else if (posts.length === 0) {
    console.log('No published posts found. Skipping indexing.');
    return;
  }

  const records = posts.map((post) => {
    const plainBody = stripHtml(post.body || '');
    const wordCount = plainBody.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    return {
      objectID: post._id,
      title: post.title,
      slug: post.slug?.current || '',
      excerpt: post.excerpt || '',
      bodyPreview: plainBody.substring(0, 500),
      publishedAt: post.publishedAt,
      publishedAtTimestamp: post.publishedAt ? new Date(post.publishedAt).getTime() : 0,
      authorName: post.author?.name || '',
      authorSlug: post.author?.slug?.current || '',
      categoryTitle: post.category?.title || '',
      categorySlug: post.category?.slug?.current || '',
      featuredImage: post.featuredImage || '',
      featuredImageAlt: post.featuredImageAlt || '',
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      focusKeyword: post.focusKeyword || '',
      keywords: post.keywords || [],
      language: post.language || 'en',
      wordCount,
      readingTime,
      url: `https://textshift.blog/blog/${post.slug?.current}/`,
    };
  });

  console.log(`Indexing ${records.length} records to Algolia...`);

  try {
    await client.setSettings({
      indexName: ALGOLIA_INDEX_NAME,
      indexSettings: {
        searchableAttributes: [
          'title',
          'excerpt',
          'bodyPreview',
          'focusKeyword',
          'keywords',
          'categoryTitle',
          'authorName',
          'metaTitle',
          'metaDescription',
        ],
        attributesForFaceting: [
          'categoryTitle',
          'authorName',
          'language',
          'keywords',
        ],
        customRanking: ['desc(publishedAtTimestamp)'],
        attributesToRetrieve: [
          'title',
          'slug',
          'excerpt',
          'publishedAt',
          'authorName',
          'authorSlug',
          'categoryTitle',
          'categorySlug',
          'featuredImage',
          'featuredImageAlt',
          'focusKeyword',
          'keywords',
          'readingTime',
          'url',
          'language',
        ],
        attributesToSnippet: ['excerpt:30', 'bodyPreview:50'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      },
    });

    await client.replaceAllObjects({
      indexName: ALGOLIA_INDEX_NAME,
      objects: records,
    });

    console.log(`Successfully indexed ${records.length} blog posts to Algolia "${ALGOLIA_INDEX_NAME}" index`);
  } catch (error) {
    console.error('Algolia indexing error:', error);
    process.exit(1);
  }
}

indexBlogPosts();
