import { create } from 'ipfs-http-client';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;
const WEB3_STORAGE_TOKEN = import.meta.env.VITE_WEB3_STORAGE_TOKEN;

export const uploadToIPFS = async (encryptedData) => {
  try {
    const blob = new Blob([encryptedData], { type: 'text/plain' });
    const file = new File([blob], 'vault.enc', { type: 'text/plain' });

    const formData = new FormData();
    formData.append('file', file);

    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', pinataOptions);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.IpfsHash;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error('Failed to upload to IPFS');
  }
};

export const downloadFromIPFS = async (cid) => {
  const gateways = [
    `https://gateway.pinata.cloud/ipfs/${cid}`,
    `https://ipfs.io/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
    `https://dweb.link/ipfs/${cid}`,
  ];

  for (const gateway of gateways) {
    try {
      const response = await fetch(gateway, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
        },
      });

      if (response.ok) {
        const data = await response.text();
        return data;
      }
    } catch (error) {
      console.error(`Failed to fetch from ${gateway}:`, error);
      continue;
    }
  }

  throw new Error('Failed to download from IPFS - all gateways failed');
};

export const pinToIPFS = async (cid) => {
  try {
    const response = await fetch(`https://api.pinata.cloud/pinning/pinByHash`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
      body: JSON.stringify({
        hashToPin: cid,
      }),
    });

    if (!response.ok) {
      throw new Error(`Pinning failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Pin to IPFS error:', error);
    throw new Error('Failed to pin to IPFS');
  }
};

export const unpinFromIPFS = async (cid) => {
  try {
    const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
      method: 'DELETE',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Unpinning failed: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Unpin from IPFS error:', error);
    throw new Error('Failed to unpin from IPFS');
  }
};

export const getIPFSStats = async () => {
  try {
    const response = await fetch('https://api.pinata.cloud/data/pinList?status=pinned', {
      method: 'GET',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get IPFS stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Get IPFS stats error:', error);
    return null;
  }
};
