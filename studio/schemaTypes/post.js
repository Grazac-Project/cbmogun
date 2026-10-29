import {defineArrayMember, defineField, defineType} from 'sanity'

const imageFields = [
  defineField({name: 'alt', title: 'Alternative text', type: 'string', validation: (r) => r.required()}),
  defineField({name: 'caption', title: 'Caption', type: 'string'}),
]

export default defineType({
  name: 'post',
  title: 'News & Events post',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required().max(110)}),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      description: 'Becomes cbmogun.org/updates/<slug>.html',
      options: {source: 'title', maxLength: 90},
      validation: (r) => r.required(),
    }),
    defineField({name: 'category', title: 'Category', type: 'reference', to: [{type: 'category'}], validation: (r) => r.required()}),
    defineField({name: 'publishedAt', title: 'Published at', type: 'datetime', initialValue: () => new Date().toISOString()}),
    defineField({
      name: 'featured',
      title: 'Featured post',
      type: 'boolean',
      description: 'Shown in the large Featured slot. If several are featured, the newest wins.',
      initialValue: false,
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'Short summary for the Featured card and search results.',
      validation: (r) => r.required().max(300),
    }),
    defineField({name: 'mainImage', title: 'Cover image', type: 'image', options: {hotspot: true}, fields: imageFields}),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'Heading 2', value: 'h2'},
            {title: 'Heading 3', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
          ],
          marks: {
            annotations: [
              {
                name: 'link',
                title: 'Link',
                type: 'object',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    validation: (r) => r.uri({allowRelative: true, scheme: ['http', 'https', 'mailto']}),
                  }),
                ],
              },
            ],
          },
        }),
        defineArrayMember({type: 'image', options: {hotspot: true}, fields: imageFields}),
      ],
    }),
    defineField({name: 'seoTitle', title: 'SEO title', type: 'string', group: 'seo', validation: (r) => r.max(70)}),
    defineField({name: 'seoDescription', title: 'SEO description', type: 'text', rows: 2, group: 'seo', validation: (r) => r.max(160)}),
  ],
  groups: [{name: 'seo', title: 'SEO'}],
  orderings: [{title: 'Newest first', name: 'publishedDesc', by: [{field: 'publishedAt', direction: 'desc'}]}],
  preview: {
    select: {title: 'title', category: 'category.title', media: 'mainImage', featured: 'featured'},
    prepare: ({title, category, media, featured}) => ({title, subtitle: [featured && '★ Featured', category].filter(Boolean).join(' · '), media}),
  },
})
