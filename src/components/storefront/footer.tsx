
"use client";

import Link from "next/link";
import { NexusCartLogo } from "@/components/icons";
import { useTranslation } from "@/hooks/use-translation";
import { useStoreContext } from "@/hooks/use-store";

function SocialIcon({ children }: { children: React.ReactNode }) {
  return (
    <Link href="#" className="text-muted-foreground hover:text-primary">
      {children}
    </Link>
  );
}

export function Footer() {
  const { t } = useTranslation();
  const { store } = useStoreContext();

  const storeName = store?.name || 'NexusCart';

  return (
    <footer className="border-t">
      <div className="container py-12">
        <div className="grid gap-8 grid-cols-2 md:grid-cols-4">
          <div className="space-y-4 col-span-2 md:col-span-1">
            <Link href="#" className="flex items-center space-x-2">
              <NexusCartLogo className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">{storeName}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t('storefront.footer.slogan')}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">{t('storefront.footer.quickLinks')}</h4>
            <ul className="space-y-1">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">{t('storefront.footer.home')}</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">{t('storefront.footer.about')}</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">{t('storefront.footer.shop')}</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">{t('storefront.footer.contact')}</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">{t('storefront.footer.customerService')}</h4>
            <ul className="space-y-1">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">{t('storefront.footer.faq')}</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">{t('storefront.footer.shippingReturns')}</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">{t('storefront.footer.privacyPolicy')}</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">{t('storefront.footer.terms')}</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">{t('storefront.footer.followUs')}</h4>
            <div className="flex space-x-4">
              <SocialIcon>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-0.732 0-1.325 0.593-1.325 1.325v21.351c0 0.731 0.593 1.324 1.325 1.324h11.494v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463 0.099 2.795 0.143v3.24l-1.918 0.001c-1.504 0-1.795 0.715-1.795 1.763v2.313h3.587l-0.467 3.622h-3.12v9.294h6.116c0.73 0 1.323-0.593 1.323-1.325v-21.35c0-0.732-0.593-1.325-1.323-1.325z"></path></svg>
              </SocialIcon>
              <SocialIcon>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584 0.012 4.85 0.07 3.252 0.148 4.771 1.691 4.919 4.919 0.058 1.265 0.07 1.646 0.07 4.85s-0.012 3.584-0.07 4.85c-0.148 3.227-1.669 4.771-4.919 4.919-1.266 0.058-1.646 0.07-4.85 0.07s-3.584-0.012-4.85-0.07c-3.252-0.148-4.771-1.691-4.919-4.919-0.058-1.265-0.07-1.646-0.07-4.85s0.012-3.584 0.07-4.85c0.148-3.227 1.669-4.771 4.919-4.919 1.266-0.058 1.646-0.07 4.85-0.07zM12 0c-3.264 0-3.664 0.012-4.942 0.072-4.236 0.194-6.78 2.618-6.978 6.978-0.06 1.278-0.073 1.678-0.073 4.942s0.013 3.664 0.072 4.942c0.198 4.359 2.742 6.78 6.978 6.978 1.278 0.06 1.678 0.073 4.942 0.073s3.664-0.013 4.942-0.072c4.237-0.198 6.782-2.742 6.978-6.978 0.06-1.278 0.073-1.678 0.073-4.942s-0.013-3.664-0.072-4.942c-0.196-4.359-2.742-6.78-6.978-6.978-1.278-0.06-1.678-0.073-4.942-0.073zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zM12 16c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zM16.965 5.595c-0.667 0-1.205 0.538-1.205 1.205s0.538 1.205 1.205 1.205 1.205-0.538 1.205-1.205-0.538-1.205-1.205-1.205z"></path></svg>
              </SocialIcon>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          {t('storefront.footer.copyright', { year: new Date().getFullYear(), storeName })}
        </div>
      </div>
    </footer>
  );
}
