import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import * as C from '@cyberui/react';
import { PageTitle } from '../Pages';
import { products } from '../products';
import { readerScenes } from './scenes';
import { ProductCards, ProductPage } from '../web-scenes/WebScenePage';

export default function ReplicaPage() {
  const { '*': path } = useParams(); const location = useLocation(); const { t } = C.useCyberUI();
  if (!path) return <><PageTitle code="06 PRODUCTS / CYBERUI" title={t('Scenes in action', '场景演示')} description={t('Six complete products. One interface system. Explore the details, make a change, and see how it feels.', '六类完整产品，一套界面系统。深入每个细节，试着交互，感受不同的使用场景。')}/><ProductCards/></>;
  if (readerScenes.some(scene => scene.id === path)) return <Navigate replace to={'/replica/reader/' + path + location.search}/>;
  const product = products.find(product => product.id === path.split('/')[0]);
  return product ? <ProductPage product={product}/> : <C.EmptyState title="404 // PRODUCT NOT FOUND" action={<Link to="/replica">{t('Scene gallery', '场景总览')}</Link>}/>;
}
