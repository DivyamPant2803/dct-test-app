export const dataTransferMedia = [
  {
    id: 'internet',
    label: 'Internet',
    channels: [
      {
        id: 'chrome',
        label: 'Google Chrome',
        output: 'Allowed with conditions',
        requirements: 'To enable data transfer using Google Chrome, users must ensure that the browser is updated to the latest stable version. Chrome must have JavaScript and cookies enabled to facilitate secure and interactive communication with web services. Data uploads and downloads are supported via both traditional form submissions and modern APIs such as Fetch and XMLHttpRequest. It is recommended to configure Content Security Policy (CSP) headers correctly when transferring sensitive data to mitigate XSS and data leakage risks. Additionally, users should confirm that Chrome’s privacy settings allow access to necessary local file directories or device media, if relevant to the data transfer process.',
      },
      {
        id: 'firefox',
        label: 'Firefox',
        output: 'Prohibited',
        requirements: 'Data transfer functionality in Firefox requires the browser to run in a standard user profile with no restrictive add-ons blocking scripts or cross-origin requests. Firefox supports advanced features such as IndexedDB and Service Workers, which can enhance offline data handling during transfer operations. For large file transfers, developers may leverage the Streams API or WebSocket protocol for continuous data flow. It is essential to configure CORS headers correctly on the server to ensure Firefox accepts and processes cross-domain requests without error. Enabling enhanced tracking protection exceptions may be required for specific use cases involving third-party services.',
      },
    ],
  },
  {
    id: 'email',
    label: 'Email',
    channels: [
      {
        id: 'outlook',
        label: 'Outlook',
        output: 'Allowed',
        requirements: 'To transfer data using Microsoft Outlook, integration typically occurs via add-ins or through automated flows using Microsoft Graph API. Outlook must be connected to an authenticated Microsoft 365 or Exchange account, and the user must have appropriate permissions to read or write mailbox contents. For exporting or sending attachments, MIME encoding standards must be followed to ensure compatibility across email clients. Additionally, if interacting with Outlook via desktop applications, make sure the local security settings and macro policies allow execution of relevant scripts or integrations. Enabling logging can be helpful for diagnosing data sync or transmission issues between Outlook and external systems.',
      },
    ],
  },
  // Add more media as needed
]; 