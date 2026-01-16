import { ethers } from 'ethers';

// Polygon RPC URL (puedes usar un provider público o Infura/Alchemy)
const POLYGON_RPC_URL = 'https://polygon.drpc.org';

// Direcciones de contratos en Polygon
const WLD_CONTRACT_ADDRESS = '0x163f8C2467924be0ae7B5347228CABF260318753';
const USDC_E_CONTRACT_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';

// ABI mínima para balanceOf
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
];

// Función para validar dirección
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

// Función para obtener balances de tokens
export async function fetchAllTokenBalances(walletAddress: string): Promise<{ WLD: string; USDC: string }> {
  if (!isValidAddress(walletAddress)) {
    throw new Error(`Invalid wallet address: ${walletAddress}`);
  }

  const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);

  try {
    let wldBalance = '0';
    let usdcBalance = '0';

    // Contrato WLD
    try {
      const wldContract = new ethers.Contract(WLD_CONTRACT_ADDRESS, ERC20_ABI, provider);
      const wldBalanceBigInt = await wldContract.balanceOf(walletAddress);
      wldBalance = ethers.formatUnits(wldBalanceBigInt, 18); // WLD tiene 18 decimales
    } catch (e) {
      console.error('Error getting WLD balance:', e);
    }

    // Contrato USDC.e
    try {
      const usdcContract = new ethers.Contract(USDC_E_CONTRACT_ADDRESS, ERC20_ABI, provider);
      const usdcBalanceBigInt = await usdcContract.balanceOf(walletAddress);
      usdcBalance = ethers.formatUnits(usdcBalanceBigInt, 6); // USDC tiene 6 decimales
    } catch (e) {
      console.error('Error getting USDC balance:', e);
    }

    return {
      WLD: wldBalance,
      USDC: usdcBalance,
    };
  } catch (error) {
    console.error('Error fetching token balances:', error);
    throw new Error(`Failed to fetch token balances: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}