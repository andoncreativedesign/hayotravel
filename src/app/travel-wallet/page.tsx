import { TravelWalletPanel } from "../../components/TravelWallet/TravelWalletPanel/TravelWalletPanel";
import styles from "./travel-wallet.module.scss";

export default async function TravelWalletPage() {
  return (
    <div className={styles.travelWalletPage}>
      <div className={styles.header}>
        <h1 className={styles.header__title}>Travel Wallet</h1>
      </div>

      <div className={styles.content}>
        <TravelWalletPanel />
      </div>
    </div>
  );
}
