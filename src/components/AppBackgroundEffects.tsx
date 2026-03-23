export const AppBackgroundEffects = () => {
  return (
    <>
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-primary/5 light:bg-primary/10 blur-[150px] rounded-full -mr-96 -mt-96 pointer-events-none z-[-1]" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-info/5 light:bg-info/10 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none z-[-1]" />
    </>
  )
}
