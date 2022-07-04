export default {
  name: 'job',
  type: 'document',
  title: 'Job',
  fields: [
    {
      name: 'company',
      type: 'string',
      title: 'Company',
    },
    {
      name: 'role',
      type: 'string',
      title: 'Role',
    },
    {
      name: 'startDate',
      type: 'date',
      title: 'Start Date',
    },
    {
      name: 'endDate',
      type: 'date',
      title: 'End Date',
    },
    {
      name: 'link',
      type: 'url',
      title: 'Link',
    },
    {
      name: 'linkTitle',
      type: 'string',
      title: 'Link Title',
    },
  ],
}
