import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * 최상위 렌더 에러 경계.
 * 자식 트리의 렌더 중 예외가 던져져도 화면 전체가 빈 채로 멈추지 않도록
 * 복구 안내와 새로고침 버튼을 보여준다.
 */
export default class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // 키·프롬프트·대화 내용이 콘솔에 남지 않도록 에러 메시지 위주로만 기록한다.
    console.error('[Persora] 렌더 오류:', error.message, info.componentStack);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-2xl font-bold">
            !
          </div>
          <div>
            <p className="text-slate-800 font-semibold">문제가 발생했어요</p>
            <p className="text-slate-500 text-sm mt-1">
              화면을 표시하는 중 오류가 발생했습니다. 새로고침해서 다시 시도해주세요.
            </p>
          </div>
          <button
            onClick={this.handleReload}
            className="px-5 py-2.5 rounded-full bg-brand-gradient text-white font-semibold text-sm shadow-glow-sm active:scale-[.98] transition-all"
          >
            새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
