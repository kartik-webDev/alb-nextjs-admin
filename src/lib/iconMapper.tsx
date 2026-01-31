// src/lib/iconMapper.tsx
import { JSX } from 'react/jsx-runtime';
import { 
  PoojaRouteSvg, OtherRouteSvg, CustomerRouteSvg,
  AstrologerRouteSvg, LiveRouteSvg, SkillRouteSvg,
  NotificationRouteSvg, RemediesRouteSvg, AnnouncementRouteSvg,
  MainExpertiesRouteSvg, LanguageRouteSvg, GiftRouteSvg,
  BlogsRouteSvg, BannerRouteSvg, RatingRouteSvg, RechargeRouteSvg
} from '../../public/assets/svg';

export const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, JSX.Element> = {
    'PoojaRouteSvg': <PoojaRouteSvg />,
    'OtherRouteSvg': <OtherRouteSvg />,
    'CustomerRouteSvg': <CustomerRouteSvg />,
    'AstrologerRouteSvg': <AstrologerRouteSvg />,
    'LiveRouteSvg': <LiveRouteSvg />,
    'SkillRouteSvg': <SkillRouteSvg />,
    'NotificationRouteSvg': <NotificationRouteSvg />,
    'RemediesRouteSvg': <RemediesRouteSvg />,
    'AnnouncementRouteSvg': <AnnouncementRouteSvg />,
    'MainExpertiesRouteSvg': <MainExpertiesRouteSvg />,
    'LanguageRouteSvg': <LanguageRouteSvg />,
    'GiftRouteSvg': <GiftRouteSvg />,
    'BlogsRouteSvg': <BlogsRouteSvg />,
    'BannerRouteSvg': <BannerRouteSvg />,
    'RatingRouteSvg': <RatingRouteSvg />,
    'RechargeRouteSvg': <RechargeRouteSvg />,
  };

  return iconMap[iconName] || <OtherRouteSvg />;
};
